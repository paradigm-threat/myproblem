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
import app.myproblem.testmode.tickets.chipLabel
import app.myproblem.testmode.tickets.pickHomeTrouble
import java.text.DateFormat
import java.util.Date

/**
 * Secondary list of tickets the batch already opened (or legacy local drafts).
 * Primary ask path is [RoomScreen] — do not mint tips from here.
 */
@Composable
fun HomeScreen(
    tickets: List<LocalTicket>,
    showArchived: Boolean,
    onOpenTicket: (String) -> Unit,
    onBackToRoom: () -> Unit,
    onSettings: () -> Unit,
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
            Text(
                "← Room",
                color = Muted,
                modifier = Modifier.clickable(onClick = onBackToRoom),
            )
            Text("Settings", color = Muted, modifier = Modifier.clickable(onClick = onSettings))
        }
        Spacer(Modifier.height(12.dp))
        Text("Tickets", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 24.sp)
        Text(
            "Opened only when AI/batch needs a tip. Ask in the public room first.",
            color = Muted,
            fontSize = 13.sp,
        )
        Spacer(Modifier.height(16.dp))
        Text(
            if (showArchived) "Open + archived" else "Open tickets",
            color = Muted,
            fontSize = 13.sp,
        )
        Spacer(Modifier.height(8.dp))
        val trouble = pickHomeTrouble(tickets)
        if (trouble != null) {
            ServerProblemBanner(sync = trouble.sync, onRetry = { onRetrySync(trouble.id) })
            Spacer(Modifier.height(12.dp))
        }
        if (tickets.isEmpty()) {
            Text(
                "No tickets yet. Go back to the room and ask — type, speak, or video.",
                color = Muted,
                fontSize = 14.sp,
            )
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Back to room", onClick = onBackToRoom)
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f, fill = false),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
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
    val whenStr =
        DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(ticket.updatedAtMs))
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
