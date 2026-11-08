package app.myproblem.testmode.ui

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SettingsScreen(
    showArchived: Boolean,
    onlineSyncEnabled: Boolean,
    onShowArchived: (Boolean) -> Unit,
    onOnlineSyncEnabled: (Boolean) -> Unit,
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
        Text(
            "New ticket always asks for Text / Audio / Audio+frames — no default start mode.",
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
                Text("Online sync (simulated)", color = Warm)
                Text(
                    "On: auto-sync marks tickets Synced. Off: stay Local only and error if sync cannot finish.",
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
        Text(
            "Real ticket APIs not wired yet — sync UI is driven by a local simulator. Evidence files stay on device.",
            color = Muted,
            fontSize = 12.sp,
        )
    }
}
