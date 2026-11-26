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

/**
 * Legacy tip-mint chooser — not the product submit path.
 * Kept for debug / E2E deep links only; product home is the public room.
 */
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
        Text("Legacy tip capture", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 24.sp)
        Text(
            "Debug only. Public asks go in the room (#mp-general) — type, speak, or video. Do not mint a tip on every ask.",
            color = Warm,
            fontWeight = FontWeight.Medium,
            fontSize = 16.sp,
        )
        Spacer(Modifier.height(4.dp))
        ModeOption(
            title = "Chat (legacy)",
            body = "Type into a local tip draft. Prefer the public room instead.",
            onClick = { onChoose(StartMode.TEXT) },
        )
        ModeOption(
            title = "Record (legacy)",
            body = "Mic/camera clip into a local tip. Prefer speak/video in the room.",
            onClick = { onChoose(StartMode.VIDEO_MESSAGE) },
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
