package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.StartMode

@Composable
fun NewTicketModeScreen(
    onCancel: () -> Unit,
    onChoose: (StartMode) -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("← Cancel", color = Muted, modifier = Modifier.clickable(onClick = onCancel))
        Text("New ticket", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 24.sp)
        Text(
            "How do you want to start this Problem?",
            color = Warm,
            fontWeight = FontWeight.Medium,
            fontSize = 16.sp,
        )
        Spacer(Modifier.height(4.dp))
        ModeOption(
            title = "Text",
            body = "Type a title and details first. Add mic or stills later on the ticket.",
            onClick = { onChoose(StartMode.TEXT) },
        )
        ModeOption(
            title = "Audio",
            body = "Record a voice note first. We’ll file from speech; you can add text anytime.",
            onClick = { onChoose(StartMode.AUDIO) },
        )
        ModeOption(
            title = "Audio + frame analysis",
            body = "Mic plus camera stills (no video file). Unique frames help guess the Problem — e.g. a flat tire.",
            onClick = { onChoose(StartMode.AUDIO_FRAMES) },
        )
    }
}

@Composable
private fun ModeOption(
    title: String,
    body: String,
    onClick: () -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .border(1.dp, Muted.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                .background(Card, RoundedCornerShape(12.dp))
                .clickable(onClick = onClick)
                .padding(14.dp),
    ) {
        Text(title, color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 17.sp)
        Spacer(Modifier.height(4.dp))
        Text(body, color = Muted, fontSize = 13.sp)
    }
}
