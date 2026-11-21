package app.myproblem.testmode.ui

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.myproblem.testmode.tickets.TicketPageStatus
import app.myproblem.testmode.tickets.TicketStepState
import java.io.File

/** Same card as the public ticket page: thumb, pill, title, summary, steps. */
@Composable
fun TicketPageStatusCard(
    status: TicketPageStatus,
    title: String,
    stillPath: String? = null,
    modifier: Modifier = Modifier,
) {
    val solved = status.pill == "Solved"
    val thumb =
        remember(stillPath) {
            val path = stillPath ?: return@remember null
            val file = File(path)
            if (!file.isFile) return@remember null
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeFile(path, bounds)
            var sample = 1
            while (bounds.outWidth / sample > 320 && sample < 16) sample *= 2
            BitmapFactory.decodeFile(path, BitmapFactory.Options().apply { inSampleSize = sample })
                ?.asImageBitmap()
        }
    Column(
        modifier =
            modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(NavyGlass.copy(alpha = 0.85f))
                .border(1.dp, Hairline, RoundedCornerShape(14.dp))
                .padding(14.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.Top) {
            if (thumb != null) {
                Image(
                    bitmap = thumb,
                    contentDescription = "First photo of this problem",
                    modifier =
                        Modifier
                            .size(72.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.dp, Hairline, RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop,
                )
            } else {
                Box(
                    Modifier
                        .size(72.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(TicketBlue.copy(alpha = 0.18f))
                        .border(1.dp, Hairline, RoundedCornerShape(12.dp)),
                )
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    status.pill,
                    color = if (solved) Mint else TicketBlue,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 12.sp,
                    modifier =
                        Modifier
                            .clip(RoundedCornerShape(999.dp))
                            .background((if (solved) Mint else TicketBlue).copy(alpha = 0.15f))
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                )
                Text(title, color = Text, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                Text(status.summary, color = TextSecondary, fontSize = 15.sp)
            }
        }
        Box(
            Modifier
                .padding(top = 14.dp, bottom = 8.dp)
                .fillMaxWidth()
                .height(1.dp)
                .background(Hairline),
        )
        status.steps.forEach { step ->
            StepRow(step.label, step.state)
        }
    }
}

@Composable
private fun StepRow(label: String, state: TicketStepState) {
    val tone =
        when (state) {
            TicketStepState.DONE -> Mint
            TicketStepState.CURRENT -> TicketBlue
            TicketStepState.LATER -> TextSecondary
        }
    Row(
        Modifier.padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            Modifier
                .size(18.dp)
                .clip(CircleShape)
                .background(if (state == TicketStepState.DONE) Mint else if (state == TicketStepState.CURRENT) TicketBlue.copy(alpha = 0.2f) else Navy)
                .border(2.dp, if (state == TicketStepState.LATER) Hairline else tone, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (state == TicketStepState.DONE) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(NavyGlass))
            }
        }
        Text(
            label,
            color = tone,
            fontWeight = if (state == TicketStepState.LATER) FontWeight.Medium else FontWeight.SemiBold,
            fontSize = 15.sp,
        )
    }
}
