package app.myproblem.testmode.ui

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import android.util.Size
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import app.myproblem.testmode.RapidFrameCapture
import app.myproblem.testmode.audio.AudioCapture
import app.myproblem.testmode.tickets.CurrentAsk
import app.myproblem.testmode.tickets.SyncState
import java.io.File
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicReference

@Composable
fun NewTicketAvScreen(
    ticketId: String,
    stillCount: Int,
    audioFileFactory: () -> File,
    stillFileFactory: () -> File,
    onCancel: () -> Unit,
    ask: String,
    sync: SyncState,
    onAudioRecorded: (File) -> Unit,
    onRollingClip: (File) -> Unit,
    onStillCaptured: (File) -> Unit,
    onRefreshAsk: () -> Unit,
    onRetrySync: () -> Unit,
    onFinish: () -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val capture = remember { AudioCapture() }
    var recording by remember { mutableStateOf(false) }
    var localStills by remember { mutableIntStateOf(stillCount) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }
    val mainExecutor = remember { ContextCompat.getMainExecutor(context) }
    val keepStill = remember { AtomicReference<(File) -> Unit>({}) }
    val stillFactory = remember { AtomicReference(stillFileFactory) }
    val rapid = remember {
        RapidFrameCapture { jpeg ->
            mainExecutor.execute {
                val file = stillFactory.get().invoke()
                file.writeBytes(jpeg)
                keepStill.get()?.invoke(file)
            }
        }
    }

    var camOk by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED,
        )
    }
    var micOk by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED,
        )
    }

    val permLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { map ->
            camOk = map[Manifest.permission.CAMERA] == true || camOk
            micOk = map[Manifest.permission.RECORD_AUDIO] == true || micOk
        }

    LaunchedEffect(stillFileFactory) {
        stillFactory.set(stillFileFactory)
    }

    LaunchedEffect(onStillCaptured) {
        keepStill.set { file ->
            localStills += 1
            onStillCaptured(file)
        }
    }

    LaunchedEffect(Unit) {
        if (!camOk || !micOk) {
            permLauncher.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO))
        }
    }

    val rollingClip by rememberUpdatedState(onRollingClip)
    val refreshAsk by rememberUpdatedState(onRefreshAsk)
    val nextAudioFile by rememberUpdatedState(audioFileFactory)

    LaunchedEffect(micOk) {
        if (micOk && !recording) {
            try {
                capture.start(nextAudioFile())
                recording = true
            } catch (e: Exception) {
                Log.w("MyProblemAv", "mic", e)
            }
        }
    }

    LaunchedEffect(recording) {
        if (!recording) return@LaunchedEffect
        while (isActive && capture.isRecording) {
            delay(12_000)
            if (!capture.isRecording) break
            val done = capture.rotate(nextAudioFile())
            if (done != null) rollingClip(done)
        }
    }

    LaunchedEffect(ticketId) {
        while (isActive) {
            delay(4_000)
            refreshAsk()
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            if (capture.isRecording) capture.stop()
            cameraExecutor.shutdown()
        }
    }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp),
    ) {
        Text("← Cancel", color = Muted, modifier = Modifier.clickable(onClick = onCancel))
        Spacer(Modifier.height(8.dp))
        Text("Live ticket · audio + frames", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 20.sp)
        Text(
            "Talk while you show the problem. Clear, new angles are kept automatically (up to 3). No video file is uploaded.",
            color = Muted,
            fontSize = 12.sp,
        )
        Spacer(Modifier.height(10.dp))
        QuestionBand(ask)
        Spacer(Modifier.height(8.dp))
        ServerProblemBanner(sync = sync, onRetry = onRetrySync)
        Spacer(Modifier.height(10.dp))

        Box(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .aspectRatio(3f / 4f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Card),
            contentAlignment = Alignment.Center,
        ) {
            if (camOk) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        PreviewView(ctx).also { previewView ->
                            val providerFuture = ProcessCameraProvider.getInstance(ctx)
                            providerFuture.addListener(
                                {
                                    val provider = providerFuture.get()
                                    val preview =
                                        Preview.Builder().build().also {
                                            it.surfaceProvider = previewView.surfaceProvider
                                        }
                                    val ic =
                                        ImageCapture.Builder()
                                            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                                            .build()
                                    val analysis =
                                        ImageAnalysis.Builder()
                                            .setResolutionSelector(
                                                ResolutionSelector.Builder()
                                                    .setResolutionStrategy(
                                                        ResolutionStrategy(
                                                            Size(640, 480),
                                                            ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER,
                                                        ),
                                                    )
                                                    .build(),
                                            )
                                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                            .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_YUV_420_888)
                                            .build()
                                            .also { it.setAnalyzer(cameraExecutor, rapid) }
                                    provider.unbindAll()
                                    try {
                                        provider.bindToLifecycle(
                                            lifecycleOwner,
                                            CameraSelector.DEFAULT_BACK_CAMERA,
                                            preview,
                                            ic,
                                            analysis,
                                        )
                                        imageCapture = ic
                                    } catch (e: Exception) {
                                        Log.w("MyProblemAv", "bind still+analysis", e)
                                        provider.unbindAll()
                                        provider.bindToLifecycle(
                                            lifecycleOwner,
                                            CameraSelector.DEFAULT_BACK_CAMERA,
                                            preview,
                                            analysis,
                                        )
                                        imageCapture = null
                                    }
                                },
                                ContextCompat.getMainExecutor(ctx),
                            )
                        }
                    },
                )
            } else {
                Text("Camera permission needed", color = Danger)
            }
        }

        Spacer(Modifier.height(10.dp))
        Text(
            if (recording) "Mic: listening" else "Mic: stopped",
            color = Warm,
            fontSize = 14.sp,
        )
        Text("Stills kept: $localStills · ticket $ticketId", color = Muted, fontSize = 12.sp)
        Spacer(Modifier.height(10.dp))
        PrimaryButton("Keep still") {
            val ic = imageCapture
            if (ic == null) {
                Toast.makeText(context, "Camera not ready", Toast.LENGTH_SHORT).show()
                return@PrimaryButton
            }
            val file = stillFileFactory()
            val opts = ImageCapture.OutputFileOptions.Builder(file).build()
            ic.takePicture(
                opts,
                cameraExecutor,
                object : ImageCapture.OnImageSavedCallback {
                    override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                        localStills += 1
                        onStillCaptured(file)
                    }

                    override fun onError(exception: ImageCaptureException) {
                        Toast.makeText(context, "Still failed", Toast.LENGTH_SHORT).show()
                    }
                },
            )
        }
        Spacer(Modifier.height(8.dp))
        if (recording) {
            PrimaryButton("Stop recording") {
                val f = capture.stop()
                recording = false
                if (f != null) onAudioRecorded(f)
            }
        }
        Spacer(Modifier.height(8.dp))
        PrimaryButton("Done — open ticket", onClick = onFinish)
    }
}

@Composable
private fun QuestionBand(ask: String) {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(Card)
                .padding(16.dp),
    ) {
        Text(ask.ifBlank { CurrentAsk.OPENING }, color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Spacer(Modifier.height(6.dp))
        Text(CurrentAsk.ANSWER_BY_TALKING, color = Muted, fontSize = 14.sp)
    }
}
