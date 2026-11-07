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
    fun worthy_whenStableUniqueAndNewSector() {
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
        assertThat(p.decision).isEqualTo(Decision.WORTHY)
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
}
