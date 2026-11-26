package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.chat.ChatEndpoints
import app.myproblem.testmode.tickets.StartMode

@Composable
fun OnboardingScreen(
    onDone: (startMode: StartMode, networkerEnabled: Boolean) -> Unit,
) {
    var networker by remember { mutableStateOf(false) }
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
            "Ask in the public room.",
            color = Warm,
            fontWeight = FontWeight.Medium,
            fontSize = 22.sp,
        )
        Text(
            "Type, speak, or video in ${ChatEndpoints.DEFAULT_IRC_CHANNEL}. Public chat and channel AI stay free. Tickets open only when the batch needs one — not on every ask.",
            color = Muted,
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(8.dp))
        Column(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .border(1.dp, Accent, RoundedCornerShape(12.dp))
                    .background(Card, RoundedCornerShape(12.dp))
                    .padding(14.dp),
        ) {
            Text("Public room", color = Accent, fontWeight = FontWeight.SemiBold)
            Text("Ready — same path as myproblem.app/#room", color = Muted, fontSize = 13.sp)
        }
        Row(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .border(1.dp, Muted.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                    .background(Card, RoundedCornerShape(12.dp))
                    .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Also enable Networker mode", color = Warm, fontWeight = FontWeight.SemiBold)
                Text(
                    "Help keep existing tips moving — photos, actions, continuity. Social gather stays in the Relay Chrome extension.",
                    color = Muted,
                    fontSize = 13.sp,
                )
            }
            Switch(
                checked = networker,
                onCheckedChange = { networker = it },
                colors = SwitchDefaults.colors(checkedTrackColor = Accent),
            )
        }
        Spacer(Modifier.height(16.dp))
        PrimaryButton("Continue", onClick = { onDone(StartMode.TEXT, networker) })
        Text("You can change Networker later in Settings.", color = Muted, fontSize = 12.sp)
    }
}
