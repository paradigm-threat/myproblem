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
import org.json.JSONObject
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
    private val coach = CoachEventTracker()
    private val ocr = OnDeviceOcr()

    private val tickSamples = ArrayDeque<Long>()
    private val analysisTimes = ArrayDeque<Long>()

    private val kept = AtomicLong(0)
    private val sent = AtomicLong(0)
    private val drops = AtomicLong(0)
    private val dropReasons = mutableMapOf<String, Int>()
    private val filledSectors = mutableSetOf<Int>()
    private val rejectedOcr = mutableSetOf<String>()

    /** HUD refresh floor — Preview stays smooth; Compose must not chase every analysis tick. */
    private var lastUiPublishNs = 0L

    companion object {
        private const val UI_MIN_INTERVAL_NS = 100_000_000L // 10 Hz HUD
        const val COACH_TAG = "MyProblemCoach"
    }

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
        val events = coach.onFeed(on, System.currentTimeMillis())
        logCoach(events)
        _state.update { it.copy(feedOn = on, coachLog = coach.snapshot()) }
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
                DebugHintMode.REQUIRE_SECTOR_NE -> DebugHintMode.REQUIRE_TEXT
                DebugHintMode.REQUIRE_TEXT -> DebugHintMode.OFF
            }
        val req =
            when (next) {
                DebugHintMode.OFF -> null
                DebugHintMode.REQUIRE_BLUE -> CaptureRequest.requireBlueDemo()
                DebugHintMode.REQUIRE_SECTOR_NE -> CaptureRequest.requireSectorDemo("NE")
                DebugHintMode.REQUIRE_TEXT -> CaptureRequest.requireTextDemo()
            }
        val events = coach.onHint(next, req?.coach, System.currentTimeMillis())
        logCoach(events)
        _state.update {
            it.copy(debugHintMode = next, captureRequest = req, coachLog = coach.snapshot())
        }
        Log.i(
            ContextBuilder.TAG,
            """{"event":"debug_hint","mode":"$next","id":${req?.id?.let { "\"$it\"" } ?: "null"}}""",
        )
    }

    fun resetSession() {
        kept.set(0)
        sent.set(0)
        drops.set(0)
        dropReasons.clear()
        filledSectors.clear()
        rejectedOcr.clear()
        analyzer.resetUniqueness()
        tickSamples.clear()
        lastUiPublishNs = 0L
        val events = coach.onReset(System.currentTimeMillis())
        logCoach(events)
        _state.update {
            it.copy(
                worthyCount = 0,
                sendCount = 0,
                dropCount = 0,
                dropsByReason = emptyMap(),
                sectorsFilled = emptySet(),
                lastPacket = null,
                lastJson = "",
                perf = PerfStats(),
                coachLog = coach.snapshot(),
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
            val ui = _state.value
            // Snapshot JPEG only if we might KEEP and need OCR — decided after gate;
            // cheap enough to grab when text hints are active.
            val maybeOcrJpeg =
                if (OcrLayer.hasTextHints(ui.captureRequest)) {
                    FrameAnalyzer.yuvToJpeg(image, quality = 55)
                } else {
                    null
                }
            image.close()

            val uniqueDist = analyzer.uniqueDistance(stats.pHash)
            val tickMs = (System.nanoTime() - t0) / 1_000_000L
            recordTick(tickMs)
            recordFps(analysisTimes, System.nanoTime())

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
                    worthyCount = kept.get().toInt(),
                    dropCount = drops.get().toInt(),
                    cameraFps = analysisFps,
                    analysisFps = analysisFps,
                    captureRequest = ui.captureRequest,
                    pack = activePack,
                )

            when (packet.decision) {
                Decision.DROP -> {
                    drops.incrementAndGet()
                    val key = packet.dropReason.label
                    dropReasons[key] = (dropReasons[key] ?: 0) + 1
                    if (drops.get() % 8L == 0L) ContextBuilder.log(packet)
                    val coachEvents = coach.onPacket(packet)
                    logCoach(coachEvents)
                    publishUi(packet, tickMs, force = coachEvents.isNotEmpty())
                }
                Decision.SEND -> {
                    // Current ask satisfied without OCR (or no text capability requested)
                    onVisualKeep(packet, stats.pHash, ui.scenarioActive)
                    sent.incrementAndGet()
                    ContextBuilder.log(packet)
                    val coachEvents = coach.onPacket(packet)
                    logCoach(coachEvents)
                    publishUi(packet, tickMs, force = true)
                }
                Decision.KEEP -> {
                    // Candidate frame — run OCR capability, then SEND or keep scanning
                    onVisualKeep(packet, stats.pHash, ui.scenarioActive)
                    ContextBuilder.log(packet)
                    val coachEvents = coach.onPacket(packet)
                    logCoach(coachEvents)
                    publishUi(packet, tickMs, force = true)
                    val jpeg = maybeOcrJpeg
                    if (jpeg != null) {
                        ocr.tryRecognizeJpeg(jpeg) { text, _ ->
                            onOcrFinished(packet, text, ui.captureRequest)
                        }
                    } else {
                        onOcrFinished(packet, "", ui.captureRequest)
                    }
                }
            }
        } catch (e: Exception) {
            try {
                image.close()
            } catch (_: Exception) {
            }
            Log.e(ContextBuilder.TAG, "analyze failed", e)
            _state.update { it.copy(error = e.message) }
        }
    }

    private fun onVisualKeep(
        packet: ContextPacket,
        pHash: Long,
        scenarioActive: Boolean,
    ) {
        kept.incrementAndGet()
        analyzer.rememberWorthy(pHash)
        if (scenarioActive) {
            filledSectors.add(packet.sectorId)
        }
    }

    private fun onOcrFinished(
        keptPacket: ContextPacket,
        text: String,
        captureRequest: CaptureRequest?,
    ) {
        val verdict = OcrLayer.evaluate(captureRequest, text, rejectedOcr.toSet())
        when (verdict.outcome) {
            OcrOutcome.REJECT, OcrOutcome.SAME_REJECTED -> {
                if (verdict.normalized.isNotEmpty()) {
                    rejectedOcr.add(verdict.normalized)
                }
            }
            else -> Unit
        }
        val finalPacket = ContextBuilder.afterOcr(keptPacket, verdict, captureRequest)
        if (finalPacket.decision == Decision.SEND) {
            sent.incrementAndGet()
        } else {
            drops.incrementAndGet()
            val key = finalPacket.dropReason.label
            dropReasons[key] = (dropReasons[key] ?: 0) + 1
        }
        ContextBuilder.log(finalPacket)
        val events = coach.onOcrVerdict(verdict, System.currentTimeMillis())
        logCoach(events)
        publishUi(finalPacket, keptPacket.tickMs, force = true)
    }

    private fun publishUi(packet: ContextPacket, tickMs: Long, force: Boolean = false) {
        val now = System.nanoTime()
        val should =
            force ||
                packet.decision == Decision.KEEP ||
                packet.decision == Decision.SEND ||
                packet.dropReason == DropReason.WRONG_TARGET ||
                packet.dropReason == DropReason.WRONG_TEXT ||
                lastUiPublishNs == 0L ||
                now - lastUiPublishNs >= UI_MIN_INTERVAL_NS
        if (!should) return
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
                worthyCount = kept.get().toInt(),
                sendCount = sent.get().toInt(),
                dropCount = drops.get().toInt(),
                dropsByReason = dropReasons.toMap(),
                sectorsFilled = filledSectors.toSet(),
                perf = perf,
                packVersion = pack.version,
                packSource = pack.source,
                coachLog = coach.snapshot(),
            )
        }
    }

    private fun logCoach(events: List<CoachLogEntry>) {
        for (e in events) {
            Log.i(COACH_TAG, """{"id":${e.id},"kind":"${e.kind}","msg":${JSONObject.quote(e.message)}}""")
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
        ocr.close()
        analysisExecutor.shutdownNow()
        super.onCleared()
    }
}
