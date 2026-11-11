package app.myproblem.testmode

import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy

/**
 * Camera analysis callback: keep a JPEG only when the gate would send a new frame.
 * The server describes that still together with the spoken transcript.
 */
class RapidFrameCapture(
    private val onJpeg: (ByteArray) -> Unit,
) : ImageAnalysis.Analyzer {
    private val frames = FrameAnalyzer()
    private var kept = 0
    private var lastKeptMs = 0L

    override fun analyze(image: ImageProxy) {
        try {
            val stats = frames.analyze(image)
            val packet =
                ContextBuilder.decide(
                    feedOn = true,
                    stats = stats,
                    attitude = AttitudeSnapshot(),
                    uniqueDistance = frames.uniqueDistance(stats.pHash),
                    sectorsFilled = emptySet(),
                    scenarioActive = false,
                    tickMs = 0,
                    worthyCount = kept,
                    dropCount = 0,
                    cameraFps = 0f,
                    analysisFps = 0f,
                )
            val now = System.currentTimeMillis()
            if (!UniqueFramePolicy.shouldKeep(packet.decision, kept, now, lastKeptMs)) return
            val jpeg = FrameAnalyzer.yuvToJpeg(image, quality = 70) ?: return
            frames.rememberWorthy(stats.pHash)
            kept += 1
            lastKeptMs = now
            onJpeg(jpeg)
        } catch (_: Exception) {
        } finally {
            image.close()
        }
    }
}
