package app.myproblem.testmode.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlin.math.max
import kotlin.math.min

/**
 * Live bar visualizer fed by [sampleLevel] (0f..1f), typically MediaRecorder amplitude.
 */
@Composable
fun AudioVisualizer(
    active: Boolean,
    sampleLevel: () -> Float,
    modifier: Modifier = Modifier,
    barCount: Int = 32,
) {
    val levels = remember { mutableStateListOf<Float>().also { list -> repeat(barCount) { list.add(0.08f) } } }
    var pulse by remember { mutableFloatStateOf(0f) }

    LaunchedEffect(active) {
        if (!active) {
            repeat(levels.size) { i -> levels[i] = 0.08f }
            pulse = 0f
            return@LaunchedEffect
        }
        while (true) {
            val raw = sampleLevel().coerceIn(0f, 1f)
            pulse = pulse * 0.55f + raw * 0.45f
            for (i in 0 until levels.lastIndex) {
                levels[i] = levels[i + 1]
            }
            val tip = min(1f, max(0.06f, pulse))
            levels[levels.lastIndex] = tip
            if (tip < 0.12f) {
                for (i in levels.indices) {
                    levels[i] = max(0.06f, levels[i] * 0.92f)
                }
            }
            delay(50L)
        }
    }

    Box(
        modifier =
            modifier
                .fillMaxWidth()
                .height(140.dp)
                .background(Card, RoundedCornerShape(16.dp))
                .padding(horizontal = 12.dp, vertical = 16.dp),
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val n = levels.size
            if (n == 0) return@Canvas
            val gap = 4.dp.toPx()
            val barW = ((size.width - gap * (n - 1)) / n).coerceAtLeast(2f)
            val maxH = size.height
            val brush = Brush.verticalGradient(colors = listOf(Accent, Warm))
            for (i in 0 until n) {
                val h = levels[i].coerceIn(0.06f, 1f) * maxH
                val x = i * (barW + gap)
                val y = (maxH - h) / 2f
                drawRoundRect(
                    brush = brush,
                    topLeft = Offset(x, y),
                    size = Size(barW, h),
                    cornerRadius = CornerRadius(barW / 2f, barW / 2f),
                )
            }
        }
    }
}
