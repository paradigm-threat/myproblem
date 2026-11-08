package app.myproblem.testmode.ui

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
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
import app.myproblem.testmode.audio.AudioCapture
import java.io.File
import java.util.concurrent.Executors

@Composable
fun NewTicketAvScreen(
    ticketId: String,
    stillCount: Int,
    audioFileFactory: () -> File,
    stillFileFactory: () -> File,
    onCancel: () -> Unit,
    onAudioRecorded: (File) -> Unit,
    onStillCaptured: (File) -> Unit,
    onFinish: () -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val capture = remember { AudioCapture() }
    var recording by remember { mutableStateOf(false) }
    var localStills by remember { mutableIntStateOf(stillCount) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }

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

    LaunchedEffect(Unit) {
        if (!camOk || !micOk) {
            permLauncher.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO))
        }
    }

    LaunchedEffect(micOk) {
        if (micOk && !recording) {
            try {
                capture.start(audioFileFactory())
                recording = true
            } catch (e: Exception) {
                Log.w("MyProblemAv", "mic", e)
            }
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
        Text("New ticket · audio + frames", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 20.sp)
        Text(
            "Preview is analysis-ready stills only — no video file is saved. Keep unique frames; stop mic when done talking.",
            color = Muted,
            fontSize = 12.sp,
        )
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
                                    imageCapture = ic
                                    provider.unbindAll()
                                    provider.bindToLifecycle(
                                        lifecycleOwner,
                                        CameraSelector.DEFAULT_BACK_CAMERA,
                                        preview,
                                        ic,
                                    )
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
            PrimaryButton("Stop mic & continue") {
                val f = capture.stop()
                recording = false
                if (f != null) onAudioRecorded(f)
                onFinish()
            }
        } else {
            PrimaryButton("Done — open ticket", onClick = onFinish)
        }
    }
}
