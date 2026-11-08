package app.myproblem.testmode.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import app.myproblem.testmode.audio.AudioCapture
import java.io.File

@Composable
fun NewTicketAudioScreen(
    ticketId: String,
    audioFileFactory: () -> File,
    onCancel: () -> Unit,
    onRecorded: (File) -> Unit,
    onAddDetails: () -> Unit,
) {
    val context = LocalContext.current
    val capture = remember { AudioCapture() }
    var recording by remember { mutableStateOf(false) }
    var hasPerm by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED,
        )
    }
    val permLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            hasPerm = granted
            if (!granted) Toast.makeText(context, "Mic permission needed", Toast.LENGTH_SHORT).show()
        }

    LaunchedEffect(hasPerm) {
        if (hasPerm && !recording && capture.outputFile == null) {
            try {
                capture.start(audioFileFactory())
                recording = true
            } catch (e: Exception) {
                Toast.makeText(context, "Mic failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            if (capture.isRecording) capture.stop()
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
        Text("New ticket · audio", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text(
            "We’ll name this from your voice when transcription lands. Add details anytime.",
            color = Muted,
            fontSize = 13.sp,
        )
        Spacer(Modifier.height(24.dp))
        Text(
            if (recording) "Listening… tap Stop when done" else "Mic idle",
            color = Warm,
            fontWeight = FontWeight.Medium,
            fontSize = 18.sp,
        )
        Text("Ticket $ticketId", color = Muted, fontSize = 11.sp)
        Spacer(Modifier.height(24.dp))
        if (!hasPerm) {
            PrimaryButton("Allow microphone") { permLauncher.launch(Manifest.permission.RECORD_AUDIO) }
        } else if (recording) {
            PrimaryButton("Stop & file ticket") {
                val f = capture.stop()
                recording = false
                if (f != null) onRecorded(f)
                else Toast.makeText(context, "Empty recording", Toast.LENGTH_SHORT).show()
            }
        } else {
            PrimaryButton("Record again") {
                try {
                    capture.start(audioFileFactory())
                    recording = true
                } catch (e: Exception) {
                    Toast.makeText(context, "Mic failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        SecondaryButton("Add details instead", onClick = onAddDetails)
    }
}
