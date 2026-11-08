package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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

@Composable
fun NewTicketTextScreen(
    onCancel: () -> Unit,
    onSubmit: (title: String, description: String) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    val fieldColors =
        OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Accent,
            unfocusedBorderColor = Muted.copy(alpha = 0.4f),
            focusedTextColor = Warm,
            unfocusedTextColor = Warm,
            cursorColor = Accent,
            focusedLabelColor = Accent,
            unfocusedLabelColor = Muted,
        )
    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(16.dp),
    ) {
        Text("← Cancel", color = Muted, modifier = Modifier.clickable(onClick = onCancel))
        Spacer(Modifier.height(8.dp))
        Text("New ticket · text", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
        Text("Start with a title — what is the Problem?", color = Muted, fontSize = 13.sp)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(10.dp),
            colors = fieldColors,
        )
        Spacer(Modifier.height(10.dp))
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Details / what you tried") },
            modifier = Modifier.fillMaxWidth().height(140.dp),
            shape = RoundedCornerShape(10.dp),
            colors = fieldColors,
        )
        Spacer(Modifier.height(20.dp))
        PrimaryButton(
            "Create ticket",
            enabled = title.trim().length >= 3,
            onClick = { onSubmit(title.trim(), description.trim()) },
        )
    }
}
