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
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.TicketStatus
import app.myproblem.testmode.tickets.TimelineKind
import app.myproblem.testmode.tickets.chipLabel

@Composable
fun TicketDetailScreen(
    ticket: LocalTicket,
    onBack: () -> Unit,
    onManualFill: (title: String, description: String) -> Unit,
    onAnswer: (question: String, answer: String) -> Unit,
    onClose: () -> Unit,
    onReopen: () -> Unit,
    onRunIntake: () -> Unit,
    onRetrySync: () -> Unit,
    onSimulateRemoteAhead: () -> Unit,
) {
    var showFill by remember { mutableStateOf(ticket.intake == IntakeStatus.NEEDS_USER_TEXT) }
    var answering by remember { mutableStateOf<String?>(null) }
    var answerText by remember { mutableStateOf("") }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp),
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("← Back", color = Muted, modifier = Modifier.clickable(onClick = onBack))
            Text(ticket.intake.chipLabel(), color = Accent, fontSize = 13.sp)
        }
        Spacer(Modifier.height(8.dp))
        Text(ticket.title, color = Warm, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        if (ticket.description.isNotBlank()) {
            Text(ticket.description, color = Muted, fontSize = 13.sp)
        }
        Spacer(Modifier.height(12.dp))
        SyncStatusCard(
            sync = ticket.sync,
            onRetry = onRetrySync,
            onSimulateRemote = onSimulateRemoteAhead,
        )
        Spacer(Modifier.height(12.dp))

        if (ticket.intake == IntakeStatus.NEEDS_USER_TEXT) {
            PrimaryButton("Add title & details") { showFill = true }
            Spacer(Modifier.height(8.dp))
        }

        if (ticket.questions.isNotEmpty() && ticket.intake == IntakeStatus.NAMED_AND_QUESTIONS) {
            Text("Quick questions", color = Accent, fontWeight = FontWeight.Medium)
            ticket.questions.forEach { q ->
                Text(
                    q,
                    color = Warm,
                    fontSize = 14.sp,
                    modifier =
                        Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .background(Chip, RoundedCornerShape(8.dp))
                            .clickable {
                                answering = q
                                answerText = ""
                            }
                            .padding(10.dp),
                )
            }
            Spacer(Modifier.height(8.dp))
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(ticket.timeline.asReversed(), key = { it.id }) { entry ->
                val color =
                    when (entry.kind) {
                        TimelineKind.SERVER_ADVICE, TimelineKind.SERVER_TITLE -> Accent
                        TimelineKind.SERVER_QUESTION -> Warm
                        TimelineKind.STATUS -> Muted
                        else -> Warm
                    }
                Column(
                    modifier =
                        Modifier
                            .fillMaxWidth()
                            .background(Card, RoundedCornerShape(10.dp))
                            .padding(10.dp),
                ) {
                    Text(entry.kind.name.lowercase().replace('_', ' '), color = Muted, fontSize = 10.sp)
                    Text(entry.body, color = color, fontSize = 14.sp)
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        SecondaryButton("Re-run local intake", onClick = onRunIntake)
        Spacer(Modifier.height(6.dp))
        if (ticket.status == TicketStatus.OPEN) {
            SecondaryButton("Close / archive", onClick = onClose)
        } else {
            SecondaryButton("Reopen", onClick = onReopen)
        }
    }

    if (showFill) {
        ManualFillDialog(
            initialTitle = ticket.title.takeIf { !it.equals("New problem", true) }.orEmpty(),
            initialDescription = ticket.description,
            onDismiss = { showFill = false },
            onSubmit = { title, desc ->
                showFill = false
                onManualFill(title, desc)
            },
        )
    }

    answering?.let { q ->
        AlertDialog(
            onDismissRequest = { answering = null },
            title = { Text(q) },
            text = {
                OutlinedTextField(
                    value = answerText,
                    onValueChange = { answerText = it },
                    modifier = Modifier.fillMaxWidth(),
                    colors =
                        OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Accent,
                            focusedTextColor = Warm,
                            unfocusedTextColor = Warm,
                        ),
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (answerText.isNotBlank()) onAnswer(q, answerText.trim())
                        answering = null
                    },
                ) { Text("Send") }
            },
            dismissButton = {
                TextButton(onClick = { answering = null }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun ManualFillDialog(
    initialTitle: String,
    initialDescription: String,
    onDismiss: () -> Unit,
    onSubmit: (String, String) -> Unit,
) {
    var title by remember { mutableStateOf(initialTitle) }
    var description by remember { mutableStateOf(initialDescription) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add ticket details") },
        text = {
            Column {
                Text("Not enough from capture yet — add a title so we can file this.", color = Muted, fontSize = 13.sp)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth().height(100.dp),
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onSubmit(title.trim(), description.trim()) },
                enabled = title.trim().length >= 3,
            ) { Text("Save") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Later") }
        },
    )
}
