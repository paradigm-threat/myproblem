package app.myproblem.testmode

import android.util.Log
import android.util.Size
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import java.util.concurrent.ExecutorService
import kotlin.math.cos
import kotlin.math.sin

private val Bg = Color(0xFF0B1410)
private val Accent = Color(0xFF5FD4A4)
private val Warm = Color(0xFFE6B35C)
private val Danger = Color(0xFFFF8F8F)
private val Muted = Color(0xFF9BB5A6)

@Composable
fun TestModeScreen(
    state: TestModeUiState,
    onToggleFeed: () -> Unit,
    onToggleScenario: () -> Unit,
    onCycleDebugHint: () -> Unit,
    onReset: () -> Unit,
    analysisExecutor: ExecutorService,
    imageAnalyzer: ImageAnalysis.Analyzer,
    feedOn: Boolean,
) {
    MaterialTheme(colorScheme = darkColorScheme(background = Bg, primary = Accent)) {
        Column(
            modifier =
                Modifier
                    .fillMaxSize()
                    .background(Bg)
                    .statusBarsPadding()
                    .navigationBarsPadding()
                    .padding(12.dp),
        ) {
            Text(
                "MyProblem · Test Mode",
                color = Accent,
                fontWeight = FontWeight.SemiBold,
                fontSize = 20.sp,
            )
            Text(
                "Offline frame gate — nothing uploads · pack ${state.packVersion}",
                color = Muted,
                fontSize = 12.sp,
            )
            Spacer(Modifier.height(8.dp))

            // Controls near top so gesture-nav doesn't eat ADB taps
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onToggleFeed,
                    colors =
                        ButtonDefaults.buttonColors(
                            containerColor = if (feedOn) Danger else Accent,
                            contentColor = if (feedOn) Color.White else Color(0xFF062016),
                        ),
                    modifier = Modifier.weight(1f),
                ) {
                    Text(if (feedOn) "Stop feed" else "Start feed")
                }
                OutlinedButton(onClick = onToggleScenario, modifier = Modifier.weight(1f)) {
                    Text(
                        if (state.scenarioActive) "Angles: ON" else "Angles: OFF",
                        color = Warm,
                    )
                }
                OutlinedButton(onClick = onReset) {
                    Text("Reset", color = Muted)
                }
            }
            Spacer(Modifier.height(6.dp))
            OutlinedButton(onClick = onCycleDebugHint, modifier = Modifier.fillMaxWidth()) {
                val hintLabel =
                    when (state.debugHintMode) {
                        DebugHintMode.OFF -> "Hint: OFF (tap = require blue)"
                        DebugHintMode.REQUIRE_BLUE -> "Hint: BLUE (tap = require NE)"
                        DebugHintMode.REQUIRE_SECTOR_NE -> "Hint: NE sector (tap = off)"
                    }
                Text(hintLabel, color = if (state.debugHintMode == DebugHintMode.OFF) Muted else Warm)
            }
            Spacer(Modifier.height(8.dp))

            Box(
                modifier =
                    Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .background(Color(0xFF122019), RoundedCornerShape(12.dp)),
            ) {
                if (feedOn) {
                    CameraPreview(
                        analyzer = imageAnalyzer,
                        executor = analysisExecutor,
                        modifier = Modifier.fillMaxSize(),
                    )
                } else {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Feed OFF — tap Start feed", color = Muted)
                    }
                }

                // Agent-can-see style indicator (local analysis only in MVP)
                Row(
                    Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp)
                        .background(Color(0xCC0B1410), RoundedCornerShape(20.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Box(
                        Modifier
                            .size(10.dp)
                            .background(if (feedOn) Accent else Muted, CircleShape),
                    )
                    Text(
                        if (feedOn) "Analysis ON (on-device)" else "Analysis OFF",
                        color = Color.White,
                        fontSize = 12.sp,
                    )
                }

                AngleGauge(
                    filled = state.sectorsFilled,
                    current = state.lastPacket?.sectorId,
                    modifier =
                        Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                            .size(96.dp),
                )
            }

            Spacer(Modifier.height(8.dp))
            HudPanel(state)

            if (state.permissionNeeded) {
                Text("Grant camera permission to continue.", color = Danger, fontSize = 12.sp)
            }
            state.error?.let {
                Text(it, color = Danger, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun HudPanel(state: TestModeUiState) {
    val p = state.lastPacket
    val decisionColor =
        when (p?.decision) {
            Decision.WORTHY -> Accent
            Decision.DROP -> Warm
            null -> Muted
        }
    Column(
        Modifier
            .fillMaxWidth()
            .background(Color(0xFF122019), RoundedCornerShape(12.dp))
            .padding(10.dp)
            .height(168.dp)
            .verticalScroll(rememberScrollState()),
    ) {
        Text(
            when {
                !state.feedOn -> "Feed OFF — tap green Start feed (not a shake gesture)"
                p?.decision == Decision.WORTHY -> "WORTHY — would upload this frame"
                p?.dropReason == DropReason.DUPLICATE ->
                    "DROP · duplicate — feed is working; move/new angle for another worthy"
                p?.dropReason == DropReason.MOTION ->
                    "DROP · shake/motion — hold still (shake is detected on-device, not by tapping)"
                p?.dropReason == DropReason.WRONG_TARGET ->
                    "DROP · wrong_target — ${p.hintFailLabel.ifBlank { "hint miss" }}; ${p.coach.ifBlank { "adjust framing" }}"
                p != null -> "Decision: ${p.decision.name} · ${p.dropReason.label}"
                else -> "Feed ON — waiting for first frame…"
            },
            color = decisionColor,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
        )
        if (state.captureRequest != null) {
            Text(
                "coach: ${state.captureRequest.coach.ifBlank { state.captureRequest.id }}",
                color = Warm,
                fontSize = 11.sp,
            )
        }
        Text(
            buildString {
                append("moving=${p?.isMoving ?: false}  shaking=${p?.isShaking ?: false}  ")
                append("sector=${p?.sectorName ?: "—"}  ")
                append("light=${"%.2f".format(p?.brightness ?: 0f)}  ")
                append("blur=${"%.2f".format(p?.blurScore ?: 0f)}  ")
                append("cx=${"%.2f".format(p?.complexity ?: 0f)}  ")
                append("cMatch=${"%.2f".format(p?.colorMatch ?: 1f)}")
            },
            color = Muted,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
        )
        Text(
            "pack=${state.packVersion}(${state.packSource})  worthy=${state.worthyCount}  drops=${state.dropCount}  " +
                "filled=${state.sectorsFilled.size}/${AngleScenario.SECTOR_COUNT}  " +
                "tick=${state.perf.lastTickMs}ms p50=${state.perf.p50Ms} p95=${state.perf.p95Ms}  " +
                "gate=${"%.1f".format(state.perf.analysisFps)}fps (preview=GPU)",
            color = Color.White,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
        )
        if (state.dropsByReason.isNotEmpty()) {
            Text(
                "drops: " + state.dropsByReason.entries.joinToString { "${it.key}=${it.value}" },
                color = Muted,
                fontSize = 10.sp,
            )
        }
        Spacer(Modifier.height(4.dp))
        Text("ContextBuilder", color = Accent, fontSize = 11.sp)
        Text(
            state.lastJson.ifBlank { "{}" },
            color = Muted,
            fontSize = 9.sp,
            fontFamily = FontFamily.Monospace,
            maxLines = 6,
        )
    }
}

@Composable
private fun AngleGauge(
    filled: Set<Int>,
    current: Int?,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier.background(Color(0x660B1410), CircleShape)) {
        val cx = size.width / 2f
        val cy = size.height / 2f
        val r = size.minDimension * 0.38f
        drawCircle(color = Color(0x44FFFFFF), radius = r + 4f, style = Stroke(2f))
        for (i in 0 until AngleScenario.SECTOR_COUNT) {
            val a0 = Math.toRadians((i * 45 - 90).toDouble())
            val a1 = Math.toRadians(((i + 1) * 45 - 90).toDouble())
            val mid = (a0 + a1) / 2.0
            val color =
                when {
                    i == current -> Accent
                    i in filled -> Warm
                    else -> Color(0x55FFFFFF)
                }
            drawLine(
                color = color,
                start = Offset(cx, cy),
                end = Offset(cx + (r * cos(mid)).toFloat(), cy + (r * sin(mid)).toFloat()),
                strokeWidth = if (i in filled || i == current) 4f else 2f,
            )
        }
        drawCircle(color = Accent, radius = 4f, center = Offset(cx, cy))
    }
}

@Composable
private fun CameraPreview(
    analyzer: ImageAnalysis.Analyzer,
    executor: ExecutorService,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    // Stable PreviewView + PERFORMANCE (GPU SurfaceView path) — not COMPATIBLE/TextureView.
    val previewView =
        remember {
            PreviewView(context).apply {
                implementationMode = PreviewView.ImplementationMode.PERFORMANCE
                scaleType = PreviewView.ScaleType.FILL_CENTER
            }
        }

    // Key only lifecycle — analyzer/executor are VM-stable. Recomposing HUD must NOT rebind camera.
    DisposableEffect(lifecycleOwner) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        val listener =
            Runnable {
                bindCamera(cameraProviderFuture.get(), lifecycleOwner, previewView, analyzer, executor)
            }
        cameraProviderFuture.addListener(listener, ContextCompat.getMainExecutor(context))
        onDispose {
            try {
                cameraProviderFuture.get().unbindAll()
            } catch (e: Exception) {
                Log.w(ContextBuilder.TAG, "unbind failed", e)
            }
        }
    }

    AndroidView(factory = { previewView }, modifier = modifier)
}

/**
 * Dual use-case bind (industry standard):
 * - Preview → full-rate GPU surface (viewfinder)
 * - ImageAnalysis → low-res YUV, KEEP_ONLY_LATEST (gate drops frames; never stalls Preview)
 */
private fun bindCamera(
    provider: ProcessCameraProvider,
    lifecycleOwner: LifecycleOwner,
    previewView: PreviewView,
    analyzer: ImageAnalysis.Analyzer,
    executor: ExecutorService,
) {
    provider.unbindAll()

    val preview =
        Preview.Builder().build().also {
            it.surfaceProvider = previewView.surfaceProvider
        }

    // Gate only needs ~VGA; lower analysis res keeps CPU off the Preview path.
    val analysisResolution =
        ResolutionSelector.Builder()
            .setResolutionStrategy(
                ResolutionStrategy(
                    Size(640, 480),
                    ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER,
                ),
            )
            .build()

    val analysis =
        ImageAnalysis.Builder()
            .setResolutionSelector(analysisResolution)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_YUV_420_888)
            .setBackgroundExecutor(executor)
            .build()
            .also { it.setAnalyzer(executor, analyzer) }

    provider.bindToLifecycle(
        lifecycleOwner,
        CameraSelector.DEFAULT_BACK_CAMERA,
        preview,
        analysis,
    )
}
