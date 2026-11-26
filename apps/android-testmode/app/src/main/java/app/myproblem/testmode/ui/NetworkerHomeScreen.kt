package app.myproblem.testmode.ui

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.LocalTicket

@Composable
fun NetworkerHomeScreen(
    tips: List<LocalTicket>,
    selectedId: String?,
    wide: Boolean,
    onSelect: (String) -> Unit,
    onAddEvidence: (String) -> Unit,
    onAddAction: (String) -> Unit,
    onAskerHome: () -> Unit,
    onSettings: () -> Unit,
) {
    val context = LocalContext.current
    val selected = tips.firstOrNull { it.id == selectedId } ?: tips.firstOrNull()

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
            Column {
                Text("MyProblem", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 24.sp)
                Text("Networker", color = Mint, fontSize = 13.sp)
            }
            Text("Settings", color = Muted, modifier = Modifier.clickable(onClick = onSettings))
        }
        Spacer(Modifier.height(12.dp))
        Text("Keep help moving.", color = Warm, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text("Small contributions make a difference.", color = Muted, fontSize = 14.sp)
        Spacer(Modifier.height(16.dp))

        if (wide) {
            Row(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Column(Modifier.weight(1f)) {
                    NeedsList(tips, selected?.id, onSelect)
                    SocialRelayLink {
                        context.startActivity(
                            Intent(Intent.ACTION_VIEW, Uri.parse("https://myproblem.app/extension")),
                        )
                    }
                }
                Column(Modifier.weight(1f)) {
                    if (selected != null) {
                        SelectedTip(selected, onAddEvidence, onAddAction)
                    } else {
                        Text("No tips need help right now.", color = Muted, fontSize = 14.sp)
                    }
                }
            }
        } else {
            Column(Modifier.weight(1f)) {
                NeedsList(tips, null) { id ->
                    onSelect(id)
                    onAddEvidence(id)
                }
                SocialRelayLink {
                    context.startActivity(
                        Intent(Intent.ACTION_VIEW, Uri.parse("https://myproblem.app/extension")),
                    )
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            Text("Networker", color = Accent, fontWeight = FontWeight.SemiBold)
            Text("Room", color = Muted, modifier = Modifier.clickable(onClick = onAskerHome))
        }
    }
}

@Composable
private fun NeedsList(
    tips: List<LocalTicket>,
    selectedId: String?,
    onSelect: (String) -> Unit,
) {
    Text("Tips that need help", color = Warm, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
    Spacer(Modifier.height(8.dp))
    if (tips.isEmpty()) {
        Text(
            "No open tips on this device yet. Tips appear when the batch opens one, or after Relay gather in Chrome.",
            color = Muted,
            fontSize = 14.sp,
        )
    } else {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(tips, key = { it.id }) { t ->
                Column(
                    modifier =
                        Modifier
                            .fillMaxWidth()
                            .background(
                                if (t.id == selectedId) Card.copy(alpha = 0.95f) else Card,
                                RoundedCornerShape(12.dp),
                            )
                            .clickable { onSelect(t.id) }
                            .padding(14.dp),
                ) {
                    Text(t.displayTitle(), color = Warm, fontWeight = FontWeight.SemiBold)
                    Text(
                        t.coachLine.ifBlank { "A photo or action update would help" },
                        color = Muted,
                        fontSize = 13.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun SelectedTip(
    tip: LocalTicket,
    onAddEvidence: (String) -> Unit,
    onAddAction: (String) -> Unit,
) {
    Text("Selected tip", color = Muted, fontSize = 13.sp)
    Text(tip.displayTitle(), color = Warm, fontWeight = FontWeight.SemiBold, fontSize = 20.sp)
    Text(
        tip.coachLine.ifBlank { "A recent photo would help." },
        color = Muted,
        fontSize = 14.sp,
    )
    Spacer(Modifier.height(12.dp))
    PrimaryButton("Add evidence", onClick = { onAddEvidence(tip.id) })
    Spacer(Modifier.height(8.dp))
    SecondaryButton("I took an action", onClick = { onAddAction(tip.id) })
}

@Composable
private fun SocialRelayLink(onOpen: () -> Unit) {
    Spacer(Modifier.height(16.dp))
    Text("Social groups", color = Warm, fontWeight = FontWeight.SemiBold)
    Spacer(Modifier.height(8.dp))
    SecondaryButton("Use Relay in Chrome", onClick = onOpen)
    Text(
        "Social gathering runs in the browser extension, not this app.",
        color = Muted,
        fontSize = 12.sp,
    )
}
