package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ContextBuilderTest {
    private fun goodStats(hash: Long = 42L) =
        ImageStats(
            brightness = 0.4f,
            contrast = 0.3f,
            blurScore = 0.1f,
            laplacianVar = 2000f,
            complexity = 0.8f,
            glareScore = 0.01f,
            frameDiffEnergy = 0.01f,
            pHash = hash,
            width = 640,
            height = 480,
        )

    private fun stillAttitude(yaw: Float = 0f) =
        AttitudeSnapshot(pitchDeg = -70f, rollDeg = 0f, yawDeg = yaw, gyroMag = 0.01f, shakeScore = 0.01f)

    @Test
    fun feedOff_drops() {
        val p =
            ContextBuilder.decide(
                feedOn = false,
                stats = goodStats(),
                attitude = stillAttitude(),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = true,
                tickMs = 1,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 0f,
                analysisFps = 0f,
                tsMs = 1L,
            )
        assertThat(p.decision).isEqualTo(Decision.DROP)
        assertThat(p.dropReason).isEqualTo(DropReason.FEED_OFF)
    }

    @Test
    fun shake_dropsAsMotion_clientOnly() {
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats(),
                attitude = stillAttitude().copy(shakeScore = 1.2f, gyroMag = 1.5f),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 2L,
            )
        assertThat(p.decision).isEqualTo(Decision.DROP)
        assertThat(p.dropReason).isEqualTo(DropReason.MOTION)
        assertThat(p.isShaking).isTrue()
    }

    @Test
    fun duplicate_dropsWhenHammingLow() {
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats(),
                attitude = stillAttitude(),
                uniqueDistance = 2,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 1,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 3L,
            )
        assertThat(p.dropReason).isEqualTo(DropReason.DUPLICATE)
    }

    @Test
    fun send_whenStableUniqueAndNewSector_noTextHint() {
        val yawSouth = 180f
        val sector = AngleScenario.sectorFromYaw(yawSouth)
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats(),
                attitude = stillAttitude(yaw = yawSouth),
                uniqueDistance = 20,
                sectorsFilled = emptySet(),
                scenarioActive = true,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 4L,
            )
        assertThat(p.decision).isEqualTo(Decision.SEND)
        assertThat(p.sendReady).isTrue()
        assertThat(p.sectorId).isEqualTo(sector)
    }

    @Test
    fun sectorAlreadyFilled_dropsWrongAngle() {
        val yaw = 0f
        val sector = AngleScenario.sectorFromYaw(yaw)
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats(),
                attitude = stillAttitude(yaw = yaw),
                uniqueDistance = 20,
                sectorsFilled = setOf(sector),
                scenarioActive = true,
                tickMs = 2,
                worthyCount = 1,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 5L,
            )
        assertThat(p.dropReason).isEqualTo(DropReason.WRONG_ANGLE)
    }

    @Test
    fun blur_drops() {
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats().copy(blurScore = 0.9f),
                attitude = stillAttitude(),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 6L,
            )
        assertThat(p.dropReason).isEqualTo(DropReason.BLUR)
    }

    private fun blueHsvStats(): ImageStats {
        val n = 16
        val hsv = FloatArray(n * 3)
        for (i in 0 until n) {
            hsv[i * 3] = 210f
            hsv[i * 3 + 1] = 0.5f
            hsv[i * 3 + 2] = 0.45f
        }
        return goodStats().copy(hsvSamples = hsv, hsvSampleCount = n)
    }

    private fun grayHsvStats(): ImageStats {
        val n = 16
        val hsv = FloatArray(n * 3)
        for (i in 0 until n) {
            hsv[i * 3] = 0f
            hsv[i * 3 + 1] = 0.02f
            hsv[i * 3 + 2] = 0.4f
        }
        return goodStats().copy(hsvSamples = hsv, hsvSampleCount = n)
    }

    @Test
    fun wrongTarget_whenBlueHintAndGrayFrame() {
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = grayHsvStats(),
                attitude = stillAttitude(),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 7L,
                captureRequest = CaptureRequest.requireBlueDemo(),
                pack = OnDevicePack(version = "1.0.0-test"),
            )
        assertThat(p.decision).isEqualTo(Decision.DROP)
        assertThat(p.dropReason).isEqualTo(DropReason.WRONG_TARGET)
        assertThat(p.packVersion).isEqualTo("1.0.0-test")
        assertThat(p.captureRequestId).isEqualTo("cr_demo_blue")
    }

    @Test
    fun send_whenBlueHintAndBlueFrame() {
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = blueHsvStats(),
                attitude = stillAttitude(),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 8L,
                captureRequest = CaptureRequest.requireBlueDemo(),
                pack = OnDevicePack(version = "1.0.0-test"),
            )
        assertThat(p.decision).isEqualTo(Decision.SEND)
        assertThat(p.colorMatch).isGreaterThan(0.9f)
    }

    @Test
    fun wrongTarget_whenSectorHintMisses() {
        val p =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats(),
                attitude = stillAttitude(yaw = 180f),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 9L,
                captureRequest = CaptureRequest.requireSectorDemo("NE"),
            )
        assertThat(p.dropReason).isEqualTo(DropReason.WRONG_TARGET)
    }

    @Test
    fun textHint_keepsThenOcrSendOrReject() {
        val kept =
            ContextBuilder.decide(
                feedOn = true,
                stats = goodStats(),
                attitude = stillAttitude(),
                uniqueDistance = 64,
                sectorsFilled = emptySet(),
                scenarioActive = false,
                tickMs = 2,
                worthyCount = 0,
                dropCount = 0,
                cameraFps = 3f,
                analysisFps = 3f,
                tsMs = 10L,
                captureRequest = CaptureRequest.requireTextDemo("SERIAL"),
            )
        assertThat(kept.decision).isEqualTo(Decision.KEEP)
        assertThat(kept.dropReason).isEqualTo(DropReason.OCR_PENDING)

        val reject =
            ContextBuilder.afterOcr(
                kept,
                OcrLayer.evaluate(CaptureRequest.requireTextDemo("SERIAL"), "MODEL ABC", emptySet()),
                CaptureRequest.requireTextDemo("SERIAL"),
            )
        assertThat(reject.decision).isEqualTo(Decision.DROP)
        assertThat(reject.dropReason).isEqualTo(DropReason.WRONG_TEXT)

        val send =
            ContextBuilder.afterOcr(
                kept,
                OcrLayer.evaluate(
                    CaptureRequest.requireTextDemo("SERIAL"),
                    "DEVICE SERIAL 99",
                    emptySet(),
                ),
                CaptureRequest.requireTextDemo("SERIAL"),
            )
        assertThat(send.decision).isEqualTo(Decision.SEND)
        assertThat(send.sendReady).isTrue()
    }
}

