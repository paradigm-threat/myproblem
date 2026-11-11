package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.ServerProblem
import app.myproblem.testmode.tickets.SyncHealth
import app.myproblem.testmode.tickets.chipLabel
import java.text.DateFormat
import java.util.Date

@Composable
fun HomeScreen(
    tickets: List<LocalTicket>,
    showArchived: Boolean,
    onNewTicket: () -> Unit,
    onOpenTicket: (String) -> Unit,
    onSettings: () -> Unit,
    onTestMode: () -> Unit,
    onRetrySync: (String) -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("MyProblem", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 24.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Settings", color = Muted, modifier = Modifier.clickable(onClick = onSettings))
                Text("Test", color = Muted, modifier = Modifier.clickable(onClick = onTestMode))
            }
        }
        Text(
            if (showArchived) "Open + archived" else "Open tickets",
            color = Muted,
            fontSize = 13.sp,
        )
        Spacer(Modifier.height(12.dp))
        PrimaryButton("New ticket", onClick = onNewTicket)
        Spacer(Modifier.height(16.dp))
        val trouble =
            tickets.firstOrNull {
                it.sync.health == SyncHealth.ERROR && it.sync.problem == ServerProblem.UNAVAILABLE
            } ?: tickets.firstOrNull { it.sync.health == SyncHealth.ERROR }
        if (trouble != null) {
            ServerProblemBanner(sync = trouble.sync, onRetry = { onRetrySync(trouble.id) })
            Spacer(Modifier.height(12.dp))
        }
        if (tickets.isEmpty()) {
            Text(
                "No open tickets yet. Tap New ticket and pick text, audio, or frames.",
                color = Muted,
                fontSize = 14.sp,
            )
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(tickets, key = { it.id }) { t ->
                    TicketRow(t, onClick = { onOpenTicket(t.id) })
                }
            }
        }
    }
}

@Composable
private fun TicketRow(
    ticket: LocalTicket,
    onClick: () -> Unit,
) {
    val whenStr = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(ticket.updatedAtMs))
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .background(Card, RoundedCornerShape(12.dp))
                .clickable(onClick = onClick)
                .padding(14.dp),
    ) {
        Text(ticket.displayTitle(), color = Warm, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(ticket.intake.chipLabel(), color = Accent, fontSize = 12.sp)
            Text(whenStr, color = Muted, fontSize = 12.sp)
        }
        Spacer(Modifier.height(6.dp))
        SyncStatusBadge(sync = ticket.sync, compact = true)
    }
}
