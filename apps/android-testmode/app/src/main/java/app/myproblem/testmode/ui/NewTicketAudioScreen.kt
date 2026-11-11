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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import app.myproblem.testmode.audio.AudioCapture
import app.myproblem.testmode.audio.StopPhraseRecognizer
import app.myproblem.testmode.tickets.CoachLines
import app.myproblem.testmode.tickets.FieldSource
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.chipLabel
import java.io.File

@Composable
fun NewTicketAudioScreen(
    ticket: LocalTicket,
    audioFileFactory: () -> File,
    onCancel: () -> Unit,
    onStop: (File?) -> Unit,
    onEditProposed: () -> Unit,
    onRetrySync: () -> Unit,
) {
    val context = LocalContext.current
    val capture = remember { AudioCapture() }
    var recording by remember { mutableStateOf(false) }
    var stopping by remember { mutableStateOf(false) }
    var hasPerm by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED,
        )
    }
    val onStopLatest = rememberUpdatedState(onStop)
    val stopPhrase =
        remember {
            StopPhraseRecognizer(context) {
                if (!stopping) {
                    stopping = true
                    val f = if (capture.isRecording) capture.stop() else null
                    recording = false
                    onStopLatest.value(f)
                }
            }
        }

    val permLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            hasPerm = granted
            if (!granted) Toast.makeText(context, "Mic permission needed", Toast.LENGTH_SHORT).show()
        }

    fun finishStop() {
        if (stopping) return
        stopping = true
        stopPhrase.stop()
        val f = if (capture.isRecording) capture.stop() else null
        recording = false
        onStop(f)
    }

    LaunchedEffect(hasPerm) {
        if (hasPerm && !recording && !stopping && capture.outputFile == null) {
            try {
                capture.start(audioFileFactory())
                recording = true
                stopPhrase.start()
            } catch (e: Exception) {
                Toast.makeText(context, "Mic failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            stopPhrase.stop()
            if (capture.isRecording) capture.stop()
        }
    }

    val coach = ticket.coachLine.ifBlank { CoachLines.STATE_PROBLEM }
    val proposedTitle = ticket.displayTitle()
    val proposedDesc = ticket.displayDescription()

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
        Text("Live audio ticket", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text(
            "Ticket already open — no later Submit. Server intake names it as you talk.",
            color = Muted,
            fontSize = 13.sp,
        )
        Text(ticket.id.take(8) + "…", color = Muted, fontSize = 11.sp)
        Spacer(Modifier.height(14.dp))

        Column(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .background(Chip, RoundedCornerShape(12.dp))
                    .padding(12.dp),
        ) {
            Text("Coach", color = Muted, fontSize = 11.sp)
            Text(coach, color = Warm, fontWeight = FontWeight.Medium, fontSize = 16.sp)
            Text(ticket.intake.chipLabel(), color = Accent, fontSize = 12.sp)
        }
        Spacer(Modifier.height(10.dp))
        ServerProblemBanner(sync = ticket.sync, onRetry = onRetrySync)

        Spacer(Modifier.height(14.dp))
        Text(
            if (recording) "Listening…" else if (stopping) "Wrapping up…" else "Mic idle",
            color = Warm,
            fontWeight = FontWeight.Medium,
            fontSize = 18.sp,
        )
        Spacer(Modifier.height(12.dp))
        AudioVisualizer(
            active = recording,
            sampleLevel = { capture.level01() },
        )
        Spacer(Modifier.height(16.dp))

        Column(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .background(Card, RoundedCornerShape(12.dp))
                    .clickable(onClick = onEditProposed)
                    .padding(12.dp),
        ) {
            val titleLabel =
                when {
                    ticket.titleField.locked -> "Title · edited by you"
                    proposedTitle.isBlank() || proposedTitle == "Listening…" || proposedTitle == "New problem" ->
                        "Title · waiting for intake"
                    else -> "Title · proposed by MyProblem"
                }
            Text(titleLabel, color = Muted, fontSize = 11.sp)
            Text(
                proposedTitle.ifBlank { "…" },
                color = Warm,
                fontWeight = FontWeight.SemiBold,
                fontSize = 17.sp,
            )
            if (proposedDesc.isNotBlank()) {
                Spacer(Modifier.height(8.dp))
                val descLabel =
                    if (ticket.descriptionField.locked) "Description · edited by you"
                    else "Description · proposed"
                Text(descLabel, color = Muted, fontSize = 11.sp)
                Text(proposedDesc, color = Warm, fontSize = 13.sp)
            }
            if (ticket.titleField.source == FieldSource.INTAKE && !ticket.titleField.locked &&
                proposedTitle.isNotBlank() && proposedTitle != "Listening…"
            ) {
                Spacer(Modifier.height(6.dp))
                Text("Tap to edit & lock · or keep talking", color = Accent, fontSize = 11.sp)
            }
        }

        Spacer(Modifier.height(24.dp))
        if (!hasPerm) {
            PrimaryButton("Allow microphone") { permLauncher.launch(Manifest.permission.RECORD_AUDIO) }
        } else if (recording) {
            PrimaryButton("Stop recording") { finishStop() }
        } else if (!stopping) {
            PrimaryButton("Record again") {
                try {
                    stopping = false
                    capture.start(audioFileFactory())
                    recording = true
                    stopPhrase.start()
                } catch (e: Exception) {
                    Toast.makeText(context, "Mic failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        SecondaryButton("Open ticket / edit details", onClick = onEditProposed)
    }
}
