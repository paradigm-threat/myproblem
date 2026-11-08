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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.StartMode

@Composable
fun OnboardingScreen(onDone: (StartMode) -> Unit) {
    var selected by remember { mutableStateOf(StartMode.AUDIO) }
    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("MyProblem", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 28.sp)
        Text(
            "How do you usually start a Problem?",
            color = Warm,
            fontWeight = FontWeight.Medium,
            fontSize = 18.sp,
        )
        Text(
            "We’ll open New ticket in this mode. Change anytime in Settings. Tickets are anonymous on this device — lose the phone without a recover email and you can lose them.",
            color = Muted,
            fontSize = 13.sp,
        )
        Spacer(Modifier.height(8.dp))
        ModeCard(
            title = "Text only",
            body = "Type a title first, then details. Camera and mic stay off until you add them.",
            selected = selected == StartMode.TEXT,
            onClick = { selected = StartMode.TEXT },
        )
        ModeCard(
            title = "Audio only",
            body = "New ticket starts the mic. We’ll file from your voice; you can add text anytime.",
            selected = selected == StartMode.AUDIO,
            onClick = { selected = StartMode.AUDIO },
        )
        ModeCard(
            title = "Audio + frames",
            body = "Mic plus camera stills (no video file). Unique frames help us guess the Problem — e.g. a flat tire photo.",
            selected = selected == StartMode.AUDIO_FRAMES,
            onClick = { selected = StartMode.AUDIO_FRAMES },
        )
        Spacer(Modifier.height(16.dp))
        PrimaryButton("Continue", onClick = { onDone(selected) })
    }
}

@Composable
private fun ModeCard(
    title: String,
    body: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .border(1.dp, if (selected) Accent else Muted.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                .background(Card, RoundedCornerShape(12.dp))
                .clickable(onClick = onClick)
                .padding(14.dp),
    ) {
        Text(title, color = if (selected) Accent else Warm, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))
        Text(body, color = Muted, fontSize = 13.sp)
    }
}
