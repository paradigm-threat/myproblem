package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class CoachEventTrackerTest {
    private fun packet(
        decision: Decision,
        reason: DropReason,
        ts: Long,
        sector: String = "S",
    ): ContextPacket {
        val sectorId = AngleScenario.sectorNames.indexOf(sector).coerceAtLeast(0)
        return ContextPacket(
            tsMs = ts,
            feedOn = true,
            decision = decision,
            dropReason = reason,
            sendReady = decision == Decision.SEND,
            tickMs = 2,
            brightness = 0.4f,
            contrast = 0.3f,
            blurScore = if (reason == DropReason.BLUR) 0.9f else 0.1f,
            laplacianVar = 100f,
            complexity = 0.5f,
            glareScore = 0.01f,
            isMoving = reason == DropReason.MOTION,
            isShaking = reason == DropReason.MOTION,
            shakeScore = if (reason == DropReason.MOTION) 1f else 0.01f,
            frameDiffEnergy = 0.01f,
            pitchDeg = -70f,
            rollDeg = 0f,
            yawDeg = 180f,
            gyroMag = 0.01f,
            sectorId = sectorId,
            sectorName = sector,
            sectorsFilled = emptyList(),
            scenario = "all_angles",
            pHash = 1L,
            uniqueDistance = 20,
            worthyCount = 0,
            dropCount = 0,
            cameraFps = 30f,
            analysisFps = 30f,
            width = 640,
            height = 480,
        )
    }

    @Test
    fun worthy_logsNewImageInView() {
        val t = CoachEventTracker()
        val fresh = t.onPacket(packet(Decision.SEND, DropReason.NONE, 1000L, "NE"))
        assertThat(fresh).hasSize(1)
        assertThat(fresh[0].kind).isEqualTo(CoachKind.NEW)
        assertThat(fresh[0].message).contains("Ask satisfied")
        assertThat(fresh[0].message).contains("NE")
    }

    @Test
    fun blur_emitsOnlyAfterSustain() {
        val t = CoachEventTracker(sustainMs = 1000L)
        assertThat(t.onPacket(packet(Decision.DROP, DropReason.BLUR, 0L))).isEmpty()
        assertThat(t.onPacket(packet(Decision.DROP, DropReason.BLUR, 500L))).isEmpty()
        val late = t.onPacket(packet(Decision.DROP, DropReason.BLUR, 1000L))
        assertThat(late).hasSize(1)
        assertThat(late[0].message).contains("Out of focus")
        // no spam
        assertThat(t.onPacket(packet(Decision.DROP, DropReason.BLUR, 2000L))).isEmpty()
    }

    @Test
    fun blurThenWorthy_logsFocusOk() {
        val t = CoachEventTracker(sustainMs = 1000L)
        t.onPacket(packet(Decision.DROP, DropReason.BLUR, 0L))
        t.onPacket(packet(Decision.DROP, DropReason.BLUR, 1000L))
        val fresh = t.onPacket(packet(Decision.SEND, DropReason.NONE, 1500L, "S"))
        assertThat(fresh.map { it.message }).contains("Focus looks good again")
        assertThat(fresh.any { it.kind == CoachKind.NEW }).isTrue()
    }

    @Test
    fun duplicate_suggestsPanAfterSameSceneHold() {
        val t = CoachEventTracker(sameSceneMs = 1500L)
        t.onPacket(packet(Decision.SEND, DropReason.NONE, 0L, "S"))
        assertThat(t.onPacket(packet(Decision.DROP, DropReason.DUPLICATE, 100L))).isEmpty()
        val held = t.onPacket(packet(Decision.DROP, DropReason.DUPLICATE, 1600L))
        assertThat(held[0].message).contains("Same scene")
        assertThat(held[0].message).contains("pan")
    }

    @Test
    fun reasonChange_resetsSustainTimer() {
        val t = CoachEventTracker(sustainMs = 1000L)
        t.onPacket(packet(Decision.DROP, DropReason.BLUR, 0L))
        t.onPacket(packet(Decision.DROP, DropReason.MOTION, 900L))
        // motion only held 0ms at 900; need another 1000 from 900
        assertThat(t.onPacket(packet(Decision.DROP, DropReason.MOTION, 1800L))).isEmpty()
        val warn = t.onPacket(packet(Decision.DROP, DropReason.MOTION, 1900L))
        assertThat(warn[0].message).contains("Shaking")
    }
}
