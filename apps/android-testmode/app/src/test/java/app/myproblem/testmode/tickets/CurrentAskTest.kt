package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class CurrentAskTest {
    @Test
    fun openingQuestion_whenNothingIsKnown() {
        assertThat(CurrentAsk.pick("", null, null)).isEqualTo(CurrentAsk.OPENING)
    }

    @Test
    fun safetyQuestion_winsOverACloserLook() {
        val ask =
            CurrentAsk.pick(
                text = "I need to repair the electric wiring in my garage.",
                serverAsk = "Look closer at the wires.",
                visionAsk = "Please provide a photo of the breaker.",
            )
        assertThat(ask.lowercase()).doesNotContain("look closer")
        assertThat(ask.lowercase()).doesNotContain("photo of")
        assertThat(ask.lowercase()).contains("sparks")
    }

    @Test
    fun serverAsk_isTheRequirementsQuestion() {
        val ask = CurrentAsk.pick("The kitchen sink is clogged.", "When did it start?", "Look closer")
        assertThat(ask).isEqualTo("When did it start?")
    }

    @Test
    fun visionAsk_showsWhenTheServerHasNoRequirementsQuestion() {
        val ask = CurrentAsk.pick("A scuff on the door.", null, "Which object is it?")
        assertThat(ask).isEqualTo("Which object is it?")
    }

    @Test
    fun questionBand_sitsAboveThePreview() {
        assertThat(CurrentAsk.questionIsAbovePreview()).isTrue()
        assertThat(CurrentAsk.sectionOrder).containsExactly("question", "preview").inOrder()
    }
}
