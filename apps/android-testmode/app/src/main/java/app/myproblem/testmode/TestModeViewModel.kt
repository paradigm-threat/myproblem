package app.myproblem.testmode

import android.app.Application
import android.util.Log
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicLong

/**
 * Preview (GPU) and analysis are separate CameraX use cases.
 * This VM only consumes ImageAnalysis frames; PreviewView paints independently at full rate.
 */
class TestModeViewModel(app: Application) : AndroidViewModel(app) {
    private val attitude = AttitudeTracker(app)
    private val analyzer = FrameAnalyzer()
    private val pack: OnDevicePack = OnDevicePackLoader.load(app)

    private val tickSamples = ArrayDeque<Long>()
    private val analysisTimes = ArrayDeque<Long>()

    private val worthy = AtomicLong(0)
    private val drops = AtomicLong(0)
    private val dropReasons = mutableMapOf<String, Int>()
    private val filledSectors = mutableSetOf<Int>()

    /** HUD refresh floor — Preview stays smooth; Compose must not chase every analysis tick. */
    private var lastUiPublishNs = 0L

    private val _state =
        MutableStateFlow(
            TestModeUiState(
                packVersion = pack.version,
                packSource = pack.source,
            ),
        )
    val state: StateFlow<TestModeUiState> = _state.asStateFlow()

    val analysisExecutor: ExecutorService =
        Executors.newSingleThreadExecutor { r ->
            // Slightly below UI so Preview / Choreographer win under load
            Thread(r, "MyProblemFrameGate").apply { priority = Thread.NORM_PRIORITY - 1 }
        }

    /**
     * Stable for the VM lifetime — must not be recreated on Compose recomposition
     * or CameraPreview will unbind/rebind and stutter.
     */
    val imageAnalyzer: ImageAnalysis.Analyzer =
        ImageAnalysis.Analyzer { image ->
            onAnalysisFrame(image)
        }

    init {
        Log.i(
            ContextBuilder.TAG,
            """{"event":"pack","version":"${pack.version}","source":"${pack.source}","disabled":${pack.packDisabled}}""",
        )
    }

    fun setPermissionNeeded(needed: Boolean) {
        _state.update { it.copy(permissionNeeded = needed) }
    }

    fun setError(msg: String?) {
        _state.update { it.copy(error = msg) }
    }

    fun setFeedOn(on: Boolean) {
        if (on) {
            attitude.start()
        } else {
            attitude.stop()
            analyzer.resetUniqueness()
        }
        _state.update { it.copy(feedOn = on) }
        Log.i(ContextBuilder.TAG, """{"event":"feed","on":$on}""")
    }

    fun toggleFeed() {
        setFeedOn(!_state.value.feedOn)
    }

    fun toggleScenario() {
        _state.update { it.copy(scenarioActive = !it.scenarioActive) }
    }

    fun cycleDebugHint() {
        val next =
            when (_state.value.debugHintMode) {
                DebugHintMode.OFF -> DebugHintMode.REQUIRE_BLUE
                DebugHintMode.REQUIRE_BLUE -> DebugHintMode.REQUIRE_SECTOR_NE
                DebugHintMode.REQUIRE_SECTOR_NE -> DebugHintMode.OFF
            }
        val req =
            when (next) {
                DebugHintMode.OFF -> null
                DebugHintMode.REQUIRE_BLUE -> CaptureRequest.requireBlueDemo()
                DebugHintMode.REQUIRE_SECTOR_NE -> CaptureRequest.requireSectorDemo("NE")
            }
        _state.update { it.copy(debugHintMode = next, captureRequest = req) }
        Log.i(
            ContextBuilder.TAG,
            """{"event":"debug_hint","mode":"$next","id":${req?.id?.let { "\"$it\"" } ?: "null"}}""",
        )
    }

    fun resetSession() {
        worthy.set(0)
        drops.set(0)
        dropReasons.clear()
        filledSectors.clear()
        analyzer.resetUniqueness()
        tickSamples.clear()
        lastUiPublishNs = 0L
        _state.update {
            it.copy(
                worthyCount = 0,
                dropCount = 0,
                dropsByReason = emptyMap(),
                sectorsFilled = emptySet(),
                lastPacket = null,
                lastJson = "",
                perf = PerfStats(),
            )
        }
        Log.i(ContextBuilder.TAG, """{"event":"reset"}""")
    }

    private fun onAnalysisFrame(image: ImageProxy) {
        if (!_state.value.feedOn) {
            image.close()
            return
        }
        val t0 = System.nanoTime()
        try {
            val stats = analyzer.analyze(image)
            // Close ASAP so CameraX can recycle the ImageAnalysis buffer;
            // Preview never shared this buffer.
            image.close()

            val uniqueDist = analyzer.uniqueDistance(stats.pHash)
            val tickMs = (System.nanoTime() - t0) / 1_000_000L
            recordTick(tickMs)
            recordFps(analysisTimes, System.nanoTime())

            val ui = _state.value
            val activePack =
                if (pack.packDisabled) {
                    OnDevicePack.NONE.copy(version = pack.version, source = pack.source)
                } else {
                    pack
                }
            val analysisFps = fpsFrom(analysisTimes)
            val packet =
                ContextBuilder.decide(
                    feedOn = true,
                    stats = stats,
                    attitude = attitude.snapshot(),
                    uniqueDistance = uniqueDist,
                    sectorsFilled = filledSectors.toSet(),
                    scenarioActive = ui.scenarioActive,
                    tickMs = tickMs,
                    worthyCount = worthy.get().toInt(),
                    dropCount = drops.get().toInt(),
                    cameraFps = analysisFps, // legacy field: analysis intake, not Preview fps
                    analysisFps = analysisFps,
                    captureRequest = ui.captureRequest,
                    pack = activePack,
                )

            if (packet.decision == Decision.WORTHY) {
                worthy.incrementAndGet()
                analyzer.rememberWorthy(stats.pHash)
                if (ui.scenarioActive) {
                    filledSectors.add(packet.sectorId)
                }
            } else {
                drops.incrementAndGet()
                val key = packet.dropReason.label
                dropReasons[key] = (dropReasons[key] ?: 0) + 1
            }

            if (packet.decision == Decision.WORTHY || drops.get() % 8L == 0L) {
                ContextBuilder.log(packet)
            }

            publishUi(packet, tickMs)
        } catch (e: Exception) {
            try {
                image.close()
            } catch (_: Exception) {
            }
            Log.e(ContextBuilder.TAG, "analyze failed", e)
            _state.update { it.copy(error = e.message) }
        }
    }

    private fun publishUi(packet: ContextPacket, tickMs: Long) {
        val now = System.nanoTime()
        val force =
            packet.decision == Decision.WORTHY ||
                packet.dropReason == DropReason.WRONG_TARGET ||
                lastUiPublishNs == 0L
        if (!force && now - lastUiPublishNs < UI_MIN_INTERVAL_NS) {
            return
        }
        lastUiPublishNs = now

        val perf =
            PerfStats(
                lastTickMs = tickMs,
                p50Ms = percentile(tickSamples, 0.50),
                p95Ms = percentile(tickSamples, 0.95),
                cameraFps = packet.analysisFps,
                analysisFps = packet.analysisFps,
            )

        _state.update {
            it.copy(
                lastPacket = packet,
                lastJson = packet.toJson().toString(),
                worthyCount = worthy.get().toInt(),
                dropCount = drops.get().toInt(),
                dropsByReason = dropReasons.toMap(),
                sectorsFilled = filledSectors.toSet(),
                perf = perf,
                packVersion = pack.version,
                packSource = pack.source,
            )
        }
    }

    private fun recordTick(ms: Long) {
        tickSamples.addLast(ms)
        while (tickSamples.size > 60) tickSamples.removeFirst()
    }

    private fun recordFps(times: ArrayDeque<Long>, nowNs: Long) {
        times.addLast(nowNs)
        val cutoff = nowNs - 1_000_000_000L
        while (times.isNotEmpty() && times.first() < cutoff) times.removeFirst()
    }

    private fun fpsFrom(times: ArrayDeque<Long>): Float {
        if (times.size < 2) return 0f
        val dt = (times.last() - times.first()) / 1_000_000_000f
        if (dt <= 0f) return 0f
        return ((times.size - 1) / dt)
    }

    private fun percentile(samples: ArrayDeque<Long>, p: Double): Long {
        if (samples.isEmpty()) return 0
        val sorted = samples.sorted()
        val idx = ((sorted.size - 1) * p).toInt().coerceIn(0, sorted.lastIndex)
        return sorted[idx]
    }

    override fun onCleared() {
        attitude.stop()
        analysisExecutor.shutdownNow()
        super.onCleared()
    }

    companion object {
        private const val UI_MIN_INTERVAL_NS = 100_000_000L // 10 Hz HUD
    }
}
