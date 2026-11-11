package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class CaptureBehaviorTest {
    @Test
    fun chrome_isQuestionThenPreview_untilTheServerMisbehaves() {
        val quiet = ticket()
        assertThat(CurrentAsk.captureChrome(quiet)).containsExactly("question", "preview").inOrder()
        assertThat(CurrentAsk.questionIsAbovePreview()).isTrue()
    }

    @Test
    fun chrome_putsTheServerLineBetweenTheQuestionAndThePreview() {
        val slow =
            ticket().copy(
                sync =
                    SyncState(
                        health = SyncHealth.ERROR,
                        problem = ServerProblem.SLOW,
                        lastError = "Intake didn't answer in time.",
                    ),
            )
        assertThat(CurrentAsk.captureChrome(slow))
            .containsExactly("question", "server", "preview")
            .inOrder()
        val banner = slow.sync.serverBanner()
        assertThat(banner?.title).isEqualTo("Server is slow")
        assertThat(banner?.body).doesNotContain("HTTP")
        assertThat(banner?.body).doesNotContain("Exception")
    }

    @Test
    fun home_showsAnUnreachableServerAheadOfASlowOne() {
        val slow = ticket("slow").copy(sync = SyncState(health = SyncHealth.ERROR, problem = ServerProblem.SLOW))
        val down =
            ticket("down").copy(
                sync = SyncState(health = SyncHealth.ERROR, problem = ServerProblem.UNAVAILABLE),
            )
        val syncing = ticket("syncing").copy(sync = SyncState(health = SyncHealth.SYNCING, syncStartedAtMs = 1L))
        assertThat(pickHomeTrouble(listOf(slow, down, syncing))?.id).isEqualTo("down")
        assertThat(pickHomeTrouble(listOf(slow, syncing))?.id).isEqualTo("slow")
        assertThat(pickHomeTrouble(listOf(syncing))).isNull()
    }

    @Test
    fun stillIntake_keepsAServerQuestionAndASafetyWarning() {
        assertThat(CurrentAsk.shouldKeep(ticket())).isFalse()
        assertThat(CurrentAsk.shouldKeep(ticket().copy(currentAsk = "When did it start?"))).isTrue()
        assertThat(
            CurrentAsk.shouldKeep(ticket().copy(coachLine = "Safety warning — electrical.")),
        ).isTrue()
    }

    @Test
    fun rollingClip_isTheUploadTheServerTreatsAsStillRecording() {
        assertThat(TicketSyncEngine.isRollingAudio("Rolling audio clip")).isTrue()
        assertThat(TicketSyncEngine.isRollingAudio("Final audio attached")).isFalse()
    }

    @Test
    fun waitingPastTheThreshold_isSlowAndStillInFlight() {
        val started = 5_000L
        val sync = SyncState(health = SyncHealth.SYNCING, syncStartedAtMs = started)
        val ticket = ticket().copy(sync = sync)
        assertThat(CurrentAsk.captureChrome(ticket, started + 1_000L)).doesNotContain("server")
        assertThat(CurrentAsk.captureChrome(ticket, started + SYNC_ERROR_AFTER_MS)).contains("server")
        assertThat(sync.serverBanner(started + SYNC_ERROR_AFTER_MS)?.waiting).isTrue()
    }

    private fun ticket(id: String = "t"): LocalTicket =
        LocalTicket(
            id = id,
            createdAtMs = 1L,
            updatedAtMs = 1L,
            status = TicketStatus.OPEN,
            title = "Sink",
            description = "",
            startMode = StartMode.AUDIO_FRAMES,
            intake = IntakeStatus.LISTENING,
            timeline = emptyList(),
        )
}
