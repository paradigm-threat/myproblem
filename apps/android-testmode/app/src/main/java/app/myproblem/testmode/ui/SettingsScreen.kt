package app.myproblem.testmode.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SettingsScreen(
    showArchived: Boolean,
    onlineSyncEnabled: Boolean,
    networkerEnabled: Boolean = false,
    onShowArchived: (Boolean) -> Unit,
    onOnlineSyncEnabled: (Boolean) -> Unit,
    onNetworkerEnabled: (Boolean) -> Unit = {},
    onBack: () -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("← Back", color = Muted, modifier = Modifier.clickable(onClick = onBack))
        Text("Settings", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        val context = LocalContext.current
        Text(
            "New ticket asks for Chat or Record. Record is one feed — turn the mic or camera on or off as you go. Chat keeps them off.",
            color = Muted,
            fontSize = 13.sp,
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Show archived", color = Warm)
                Text("Closed tickets stay hidden by default", color = Muted, fontSize = 12.sp)
            }
            Switch(
                checked = showArchived,
                onCheckedChange = onShowArchived,
                colors = SwitchDefaults.colors(checkedTrackColor = Accent),
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Online sync", color = Warm)
                Text(
                    "On: this phone sends the ticket, audio, and stills to Intake. Off: the ticket stays on this phone.",
                    color = Muted,
                    fontSize = 12.sp,
                )
            }
            Switch(
                checked = onlineSyncEnabled,
                onCheckedChange = onOnlineSyncEnabled,
                colors = SwitchDefaults.colors(checkedTrackColor = Accent),
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Networker mode", color = Warm)
                Text(
                    "Keep existing tips moving — add photos or note actions. Social gather stays in the Relay Chrome extension.",
                    color = Muted,
                    fontSize = 12.sp,
                )
            }
            Switch(
                checked = networkerEnabled,
                onCheckedChange = onNetworkerEnabled,
                colors = SwitchDefaults.colors(checkedTrackColor = Accent),
            )
        }
        Text(
            "MyProblem is not a licensed electrician, doctor, or emergency service. If someone is in danger, use your local emergency number.",
            color = Muted,
            fontSize = 12.sp,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Text(
                "Privacy",
                color = Accent,
                modifier = Modifier.clickable { openPage(context, "https://myproblem.app/privacy") },
            )
            Text(
                "Terms",
                color = Accent,
                modifier = Modifier.clickable { openPage(context, "https://myproblem.app/terms") },
            )
        }
    }
}

private fun openPage(context: android.content.Context, url: String) {
    runCatching {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    }
}
