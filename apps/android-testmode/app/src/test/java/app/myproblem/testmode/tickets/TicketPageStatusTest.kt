package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class TicketPageStatusTest {
    @Test
    fun openTicket_isSubmittedAndWaiting() {
        val status = TicketPageStatus.of(solved = false)
        assertThat(status.pill).isEqualTo("Awaiting review")
        assertThat(status.summary).contains("Waiting for the AI pass")
        assertThat(status.summary).contains("people")
        assertThat(status.summary.lowercase()).doesNotContain("fix plan")
        assertThat(status.steps.map { it.id to it.state })
            .containsExactly(
                "submitted" to TicketStepState.DONE,
                "ai" to TicketStepState.CURRENT,
                "people" to TicketStepState.CURRENT,
                "plan" to TicketStepState.LATER,
                "solved" to TicketStepState.LATER,
            )
            .inOrder()
    }

    @Test
    fun solvedTicket_completesEveryStep() {
        val status = TicketPageStatus.of(solved = true)
        assertThat(status.pill).isEqualTo("Solved")
        assertThat(status.steps.map { it.state }.distinct()).containsExactly(TicketStepState.DONE)
        assertThat(status.steps.last().id).isEqualTo("solved")
    }
}
