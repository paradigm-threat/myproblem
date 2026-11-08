package app.myproblem.testmode

import app.myproblem.testmode.tickets.IntakeHeuristics
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.StartMode
import app.myproblem.testmode.tickets.TicketStatus
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class IntakeHeuristicsTest {
    private fun base() =
        LocalTicket(
            id = "t1",
            createdAtMs = 1,
            updatedAtMs = 1,
            status = TicketStatus.OPEN,
            title = "New problem",
            description = "",
            startMode = StartMode.AUDIO,
            intake = IntakeStatus.DRAFT,
            timeline = emptyList(),
        )

    @Test
    fun stillsAlone_namesAndQuestions() {
        val d = IntakeHeuristics.decide(base().copy(stillCount = 1))
        assertThat(d.intake).isEqualTo(IntakeStatus.NAMED_AND_QUESTIONS)
        assertThat(d.questions).isNotEmpty()
    }

    @Test
    fun audioWithoutText_needsUserText() {
        val d = IntakeHeuristics.decide(base().copy(hasAudio = true))
        assertThat(d.intake).isEqualTo(IntakeStatus.NEEDS_USER_TEXT)
    }

    @Test
    fun titledWithDescription_queuesProject() {
        val d =
            IntakeHeuristics.decide(
                base().copy(title = "Flat tire", description = "Left rear went flat on I-75"),
            )
        assertThat(d.intake).isEqualTo(IntakeStatus.QUEUE_PROJECT)
    }
}
