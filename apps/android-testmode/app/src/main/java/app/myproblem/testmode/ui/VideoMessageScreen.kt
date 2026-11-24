package app.myproblem.testmode.ui

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FallbackStrategy
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import kotlinx.coroutines.delay
import java.io.File
import java.util.concurrent.Executor

private const val MAX_RECORD_MS = 180_000L

/**
 * Record: one deferred clip. Mic and camera are toggles on the same feed.
 * Preview first, short copy — Max and simple.
 */
@Composable
fun VideoMessageScreen(
    fileFactory: () -> File,
    sending: Boolean,
    error: String?,
    onCancel: () -> Unit,
    onSend: (File) -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val mainExecutor = remember { ContextCompat.getMainExecutor(context) }
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
    var capture by remember { mutableStateOf<VideoCapture<Recorder>?>(null) }
    var recording by remember { mutableStateOf<Recording?>(null) }
    var file by remember { mutableStateOf<File?>(null) }
    var startedAt by remember { mutableLongStateOf(0L) }
    var elapsed by remember { mutableLongStateOf(0L) }
    var readyToSend by remember { mutableStateOf(false) }
    var micOn by remember { mutableStateOf(true) }
    var cameraOn by remember { mutableStateOf(true) }
    val permsOk = camOk && micOk

    BackHandler(enabled = !sending) { onCancel() }
    DisposableEffect(Unit) {
        onDispose { recording?.stop() }
    }

    LaunchedEffect(recording, startedAt) {
        if (recording == null) return@LaunchedEffect
        while (recording != null) {
            elapsed = System.currentTimeMillis() - startedAt
            if (elapsed >= MAX_RECORD_MS) {
                recording?.stop()
                break
            }
            delay(250)
        }
    }

    LaunchedEffect(micOn, recording) {
        recording?.mute(!micOn)
    }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Text("← Cancel", color = Muted, modifier = Modifier.clickable(enabled = !sending, onClick = onCancel))
        Spacer(Modifier.height(6.dp))
        Text("Record", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text(
            "Mic, camera, or both. One clip. Stop, then Send.",
            color = Warm,
            fontSize = 15.sp,
            fontWeight = FontWeight.Medium,
        )
        Spacer(Modifier.height(10.dp))

        Box(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Card)
                    .border(1.dp, Hairline, RoundedCornerShape(14.dp)),
            contentAlignment = Alignment.Center,
        ) {
            if (permsOk) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        PreviewView(ctx).also { previewView ->
                            val future = ProcessCameraProvider.getInstance(ctx)
                            future.addListener(
                                {
                                    val provider = future.get()
                                    val preview =
                                        Preview.Builder().build().also {
                                            it.surfaceProvider = previewView.surfaceProvider
                                        }
                                    val recorder =
                                        Recorder.Builder()
                                            .setQualitySelector(
                                                QualitySelector.fromOrderedList(
                                                    listOf(Quality.LOWEST, Quality.SD),
                                                    FallbackStrategy.lowerQualityOrHigherThan(Quality.LOWEST),
                                                ),
                                            )
                                            .build()
                                    val video = VideoCapture.withOutput(recorder)
                                    provider.unbindAll()
                                    provider.bindToLifecycle(
                                        lifecycleOwner,
                                        CameraSelector.DEFAULT_BACK_CAMERA,
                                        preview,
                                        video,
                                    )
                                    capture = video
                                },
                                mainExecutor,
                            )
                        }
                    },
                )
                if (!cameraOn) {
                    Box(
                        modifier =
                            Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = 0.92f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Camera off", color = Warm, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                            Text("Audio-only for this clip", color = Muted, fontSize = 13.sp)
                        }
                    }
                }
                if (recording != null) {
                    Text(
                        "● ${formatElapsed(elapsed)}",
                        color = Danger,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        modifier =
                            Modifier
                                .align(Alignment.TopStart)
                                .padding(12.dp)
                                .background(Color.Black.copy(alpha = 0.55f), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                    )
                }
                Row(
                    modifier =
                        Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .padding(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    FeedToggle(
                        label = "Mic",
                        on = micOn,
                        enabled = !sending,
                        modifier = Modifier.weight(1f),
                        onClick = { micOn = !micOn },
                    )
                    FeedToggle(
                        label = "Camera",
                        on = cameraOn,
                        enabled = !sending,
                        modifier = Modifier.weight(1f),
                        onClick = { cameraOn = !cameraOn },
                    )
                }
            } else {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(20.dp),
                ) {
                    Text(
                        "Camera and microphone stay on this phone until you Send. The batch watches the clip, then deletes it.",
                        color = Muted,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(14.dp))
                    PrimaryButton("Allow camera and microphone") {
                        permLauncher.launch(
                            arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO),
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(10.dp))
        if (error != null) {
            Text(error, color = Danger, fontSize = 14.sp)
            Spacer(Modifier.height(6.dp))
        }
        if (permsOk) {
            when {
                sending -> Text("Sending…", color = Warm, fontSize = 15.sp)
                recording != null ->
                    PrimaryButton("Stop") { recording?.stop() }
                readyToSend && file != null -> {
                    PrimaryButton("Send") { onSend(file!!) }
                    Spacer(Modifier.height(8.dp))
                    SecondaryButton("Record again") {
                        file?.delete()
                        file = null
                        readyToSend = false
                        elapsed = 0L
                    }
                }
                else ->
                    PrimaryButton("Record") {
                        if (!micOn && !cameraOn) {
                            Toast.makeText(context, "Turn on the mic or the camera", Toast.LENGTH_SHORT).show()
                            return@PrimaryButton
                        }
                        val video = capture
                        if (video == null) {
                            Toast.makeText(context, "Camera not ready", Toast.LENGTH_SHORT).show()
                            return@PrimaryButton
                        }
                        val out = fileFactory()
                        file = out
                        readyToSend = false
                        startedAt = System.currentTimeMillis()
                        elapsed = 0L
                        recording =
                            startClip(context, video, out, mainExecutor, startMuted = !micOn) { ok ->
                                recording = null
                                readyToSend = ok
                            }
                    }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            "Not published. Not kept. The batch removes faces, plates, and places — or deletes the file.",
            color = Muted,
            fontSize = 12.sp,
        )
    }
}

@Composable
private fun FeedToggle(
    label: String,
    on: Boolean,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(12.dp)
    Box(
        modifier =
            modifier
                .height(48.dp)
                .clip(shape)
                .background(if (on) Accent else Chip)
                .border(1.dp, if (on) Accent else Hairline, shape)
                .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            if (on) "$label on" else "$label off",
            color = if (on) Bg else Warm,
            fontWeight = FontWeight.SemiBold,
            fontSize = 15.sp,
        )
    }
}

private fun formatElapsed(ms: Long): String {
    val total = (ms / 1000).coerceAtLeast(0)
    return "%d:%02d".format(total / 60, total % 60)
}

@SuppressLint("MissingPermission")
private fun startClip(
    context: android.content.Context,
    video: VideoCapture<Recorder>,
    file: File,
    executor: Executor,
    startMuted: Boolean,
    onDone: (Boolean) -> Unit,
): Recording {
    val rec =
        video.output
            .prepareRecording(context, FileOutputOptions.Builder(file).build())
            .withAudioEnabled()
            .start(executor) { event ->
                if (event is VideoRecordEvent.Finalize) {
                    val ok =
                        event.error == VideoRecordEvent.Finalize.ERROR_NONE &&
                            file.exists() &&
                            file.length() > 0L
                    onDone(ok)
                }
            }
    if (startMuted) rec.mute(true)
    return rec
}
