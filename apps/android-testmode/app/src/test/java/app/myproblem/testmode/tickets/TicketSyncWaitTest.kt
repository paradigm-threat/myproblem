package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class TicketSyncWaitTest {
    @Test
    fun keepsPollingWhileAStillIsStillQueued() {
        assertThat(TicketSyncEngine.isWaitingOnServer(IntakeStatus.QUEUED)).isTrue()
        assertThat(TicketSyncEngine.isWaitingOnServer(IntakeStatus.INVESTIGATING)).isTrue()
        assertThat(TicketSyncEngine.isWaitingOnServer(IntakeStatus.TRANSCRIBING)).isTrue()
        assertThat(TicketSyncEngine.isWaitingOnServer(IntakeStatus.NAMED_AND_QUESTIONS)).isFalse()
    }
}
