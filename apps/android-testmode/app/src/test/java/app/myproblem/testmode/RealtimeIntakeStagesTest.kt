package app.myproblem.testmode

import app.myproblem.testmode.tickets.CoachLines
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LiveAudioIntakeSim
import app.myproblem.testmode.tickets.LiveAudioSession
import app.myproblem.testmode.tickets.RealtimeIntakeStages
import app.myproblem.testmode.tickets.RealtimeStage
import app.myproblem.testmode.tickets.TimelineKind
import app.myproblem.testmode.tickets.TimelinePolicy
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class RealtimeIntakeStagesTest {
    @Test
    fun coachAndChip_lockstep_whileListening() {
        val prompt = RealtimeIntakeStages.whileRecording(0)
        assertThat(prompt).isEqualTo(RealtimeStage.LISTENING_PROMPT)
        assertThat(RealtimeIntakeStages.intakeStatus(prompt)).isEqualTo(IntakeStatus.LISTENING)
        assertThat(RealtimeIntakeStages.coachLine(prompt)).isEqualTo(CoachLines.STATE_PROBLEM)

        val partial = RealtimeIntakeStages.whileRecording(1)
        assertThat(RealtimeIntakeStages.coachLine(partial)).isEqualTo(CoachLines.REFINE)
        assertThat(RealtimeIntakeStages.intakeStatus(partial)).isEqualTo(IntakeStatus.LISTENING)

        val refine = RealtimeIntakeStages.whileRecording(3)
        assertThat(RealtimeIntakeStages.coachLine(refine)).contains(CoachLines.STOP_HINT)
        assertThat(RealtimeIntakeStages.intakeStatus(refine)).isEqualTo(IntakeStatus.LISTENING)
    }

    @Test
    fun afterStop_queuedNotTranscribing_untilBatch() {
        val stop = RealtimeIntakeStages.immediatelyAfterStop(chunkCount = 3, hasUsableTitle = true)
        assertThat(stop).isEqualTo(RealtimeStage.QUEUED)
        assertThat(RealtimeIntakeStages.coachLine(stop)).isEqualTo(CoachLines.QUEUED)
        assertThat(RealtimeIntakeStages.intakeStatus(stop)).isEqualTo(IntakeStatus.QUEUED)

        val clarify = RealtimeIntakeStages.immediatelyAfterStop(0, hasUsableTitle = false)
        assertThat(clarify).isEqualTo(RealtimeStage.CLARIFY)
        assertThat(RealtimeIntakeStages.intakeStatus(clarify)).isEqualTo(IntakeStatus.NEEDS_USER_TEXT)
    }

    @Test
    fun simulateHistory_isTimely() {
        val hist = LiveAudioIntakeSim.simulateStageHistory(chunks = 3)
        assertThat(RealtimeIntakeStages.validateTimely(hist)).isEmpty()
        assertThat(hist.first()).isEqualTo(RealtimeStage.LISTENING_PROMPT)
        assertThat(hist).contains(RealtimeStage.QUEUED)
        assertThat(hist).contains(RealtimeStage.TRANSCRIBING)
        val q = hist.indexOf(RealtimeStage.QUEUED)
        val t = hist.indexOf(RealtimeStage.TRANSCRIBING)
        val f = hist.indexOf(RealtimeStage.FIGURING_OUT)
        assertThat(q).isLessThan(t)
        assertThat(t).isLessThan(f)
    }

    @Test
    fun session_timelyStatuses_and_majorLogOnly() {
        val session = LiveAudioSession()
        session.start()
        assertThat(session.coachLine).isEqualTo(CoachLines.STATE_PROBLEM)
        assertThat(session.intake).isEqualTo(IntakeStatus.LISTENING)

        session.onChunk()
        assertThat(session.coachLine).isEqualTo(CoachLines.REFINE)
        assertThat(session.intake).isEqualTo(IntakeStatus.LISTENING)
        assertThat(session.title).isNotEqualTo("Listening…")

        session.onChunk()
        session.onChunk()
        assertThat(session.coachLine).contains(CoachLines.STOP_HINT)

        // Chunks must not spam timeline
        assertThat(session.timeline.count { it.kind == TimelineKind.USER_AUDIO }).isEqualTo(0)

        session.stop(hasFinalAudio = true)
        assertThat(session.intake).isEqualTo(IntakeStatus.QUEUED)
        assertThat(session.coachLine).isEqualTo(CoachLines.QUEUED)
        assertThat(session.stageHistory).contains(RealtimeStage.QUEUED)
        assertThat(session.stageHistory).doesNotContain(RealtimeStage.FIGURING_OUT)
        assertThat(session.timelyViolations()).isEmpty()

        assertThat(session.timeline.count { it.kind == TimelineKind.USER_AUDIO }).isEqualTo(1)
        assertThat(session.timeline.none { it.kind == TimelineKind.STATUS }).isTrue()
        assertThat(session.majorTimelineKinds()).contains(TimelineKind.SYSTEM)
    }

    @Test
    fun session_earlyStop_clarify_noFiguring() {
        val session = LiveAudioSession()
        session.start()
        session.stop(hasFinalAudio = false)
        assertThat(session.intake).isEqualTo(IntakeStatus.NEEDS_USER_TEXT)
        assertThat(session.coachLine).isEqualTo(CoachLines.CLARIFY)
        assertThat(session.stageHistory).doesNotContain(RealtimeStage.FIGURING_OUT)
        assertThat(session.timelyViolations()).isEmpty()
    }

    @Test
    fun timelinePolicy_statusNotMajor() {
        assertThat(TimelinePolicy.isMajor(TimelineKind.STATUS)).isFalse()
        assertThat(TimelinePolicy.isMajor(TimelineKind.USER_AUDIO)).isTrue()
        assertThat(TimelinePolicy.isMajor(TimelineKind.SERVER_TITLE)).isTrue()
    }

    @Test
    fun prematureFiguring_failsTimeliness() {
        val bad =
            listOf(
                RealtimeStage.LISTENING_PROMPT,
                RealtimeStage.FIGURING_OUT,
                RealtimeStage.ADVICE_READY,
            )
        assertThat(RealtimeIntakeStages.validateTimely(bad)).isNotEmpty()
    }
}
