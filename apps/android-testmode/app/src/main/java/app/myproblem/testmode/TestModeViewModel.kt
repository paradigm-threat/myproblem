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
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

class TestModeViewModel(app: Application) : AndroidViewModel(app) {
    private val attitude = AttitudeTracker(app)
    private val analyzer = FrameAnalyzer()
    private val analyzing = AtomicBoolean(false)

    private val tickSamples = ArrayDeque<Long>()
    private val cameraFrameTimes = ArrayDeque<Long>()
    private val analysisTimes = ArrayDeque<Long>()

    private val worthy = AtomicLong(0)
    private val drops = AtomicLong(0)
    private val dropReasons = mutableMapOf<String, Int>()
    private val filledSectors = mutableSetOf<Int>()

    private val _state = MutableStateFlow(TestModeUiState())
    val state: StateFlow<TestModeUiState> = _state.asStateFlow()

    val analysisExecutor: ExecutorService =
        Executors.newSingleThreadExecutor { r ->
            Thread(r, "MyProblemFrameGate").apply { priority = Thread.NORM_PRIORITY }
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
            // keep counts for session visibility
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

    fun resetSession() {
        worthy.set(0)
        drops.set(0)
        dropReasons.clear()
        filledSectors.clear()
        analyzer.resetUniqueness()
        tickSamples.clear()
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

    fun imageAnalyzer(): ImageAnalysis.Analyzer =
        ImageAnalysis.Analyzer { image ->
            onFrame(image)
        }

    private fun onFrame(image: ImageProxy) {
        val now = System.nanoTime()
        recordFps(cameraFrameTimes, now)
        if (!_state.value.feedOn) {
            image.close()
            return
        }
        if (!analyzing.compareAndSet(false, true)) {
            image.close()
            return
        }
        val t0 = System.nanoTime()
        try {
            val stats = analyzer.analyze(image)
            val uniqueDist = analyzer.uniqueDistance(stats.pHash)
            val tickMs = (System.nanoTime() - t0) / 1_000_000L
            recordTick(tickMs)
            recordFps(analysisTimes, System.nanoTime())

            val scenarioActive = _state.value.scenarioActive
            val packet =
                ContextBuilder.decide(
                    feedOn = true,
                    stats = stats,
                    attitude = attitude.snapshot(),
                    uniqueDistance = uniqueDist,
                    sectorsFilled = filledSectors.toSet(),
                    scenarioActive = scenarioActive,
                    tickMs = tickMs,
                    worthyCount = worthy.get().toInt(),
                    dropCount = drops.get().toInt(),
                    cameraFps = fpsFrom(cameraFrameTimes),
                    analysisFps = fpsFrom(analysisTimes),
                )

            if (packet.decision == Decision.WORTHY) {
                worthy.incrementAndGet()
                analyzer.rememberWorthy(stats.pHash)
                if (scenarioActive) {
                    filledSectors.add(packet.sectorId)
                }
            } else {
                drops.incrementAndGet()
                val key = packet.dropReason.label
                dropReasons[key] = (dropReasons[key] ?: 0) + 1
            }

            // Log worthy always; log drops at a lower rate to avoid flooding
            if (packet.decision == Decision.WORTHY || drops.get() % 8L == 0L) {
                ContextBuilder.log(packet)
            }

            val perf =
                PerfStats(
                    lastTickMs = tickMs,
                    p50Ms = percentile(tickSamples, 0.50),
                    p95Ms = percentile(tickSamples, 0.95),
                    cameraFps = packet.cameraFps,
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
                )
            }
        } catch (e: Exception) {
            Log.e(ContextBuilder.TAG, "analyze failed", e)
            _state.update { it.copy(error = e.message) }
        } finally {
            analyzing.set(false)
            image.close()
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
}
