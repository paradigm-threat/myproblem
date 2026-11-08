package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.SyncHealth
import app.myproblem.testmode.tickets.SyncPresence
import app.myproblem.testmode.tickets.SyncState
import app.myproblem.testmode.tickets.chipLabel

@Composable
fun SyncStatusBadge(
    sync: SyncState,
    compact: Boolean = true,
    modifier: Modifier = Modifier,
) {
    val dot =
        when {
            sync.health == SyncHealth.ERROR -> Danger
            sync.health == SyncHealth.SYNCING -> Warm
            sync.health == SyncHealth.IN_SYNC && sync.presence == SyncPresence.ONLINE -> Accent
            sync.health == SyncHealth.LOCAL_AHEAD || sync.health == SyncHealth.REMOTE_AHEAD -> Warm
            else -> Muted
        }
    Column(modifier = modifier) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Box(
                modifier =
                    Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(dot),
            )
            Text(
                sync.chipLabel(),
                color = dot,
                fontSize = if (compact) 12.sp else 13.sp,
                fontWeight = FontWeight.Medium,
            )
            if (!compact && sync.presence == SyncPresence.ONLINE && sync.serverTicketId != null) {
                Text("· ${sync.serverTicketId}", color = Muted, fontSize = 11.sp)
            }
        }
        if (sync.health == SyncHealth.SYNCING) {
            LinearProgressIndicator(
                progress = { sync.progress ?: 0.15f },
                modifier =
                    Modifier
                        .padding(top = 4.dp)
                        .fillMaxWidth(if (compact) 0.45f else 1f)
                        .height(3.dp),
                color = Warm,
                trackColor = Chip,
            )
        }
        if (!compact && sync.lastError != null && sync.health == SyncHealth.ERROR) {
            Text(sync.lastError, color = Danger, fontSize = 11.sp)
        }
    }
}

@Composable
fun SyncStatusCard(
    sync: SyncState,
    onRetry: () -> Unit,
    onSimulateRemote: (() -> Unit)? = null,
) {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .background(Card, RoundedCornerShape(10.dp))
                .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(
            if (sync.presence == SyncPresence.ONLINE) "Online ticket" else "Local-only ticket",
            color = Warm,
            fontWeight = FontWeight.SemiBold,
            fontSize = 14.sp,
        )
        SyncStatusBadge(sync = sync, compact = false)
        Text(
            "rev local ${sync.localRevision} · remote ${sync.remoteRevision}",
            color = Muted,
            fontSize = 11.sp,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SecondaryButton("Retry sync", modifier = Modifier.weight(1f), onClick = onRetry)
            if (onSimulateRemote != null && sync.presence == SyncPresence.ONLINE) {
                SecondaryButton(
                    "Server ahead",
                    modifier = Modifier.weight(1f),
                    onClick = onSimulateRemote,
                )
            }
        }
    }
}
