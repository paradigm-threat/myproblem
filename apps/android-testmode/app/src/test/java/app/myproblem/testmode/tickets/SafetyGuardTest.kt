package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class SafetyGuardTest {
    @Test
    fun garageWiring_warnsAndDoesNotGiveSteps() {
        val hazard = SafetyGuard.classify("I need to repair the electric wiring in my garage.")
        assertThat(hazard).isNotNull()
        assertThat(hazard!!.id).isEqualTo("electrical")
        assertThat(hazard.warning).contains("does not verify")
        assertThat(hazard.warning.lowercase()).doesNotContain("splice")
        assertThat(hazard.questions.joinToString(" ").lowercase()).doesNotContain("splice")
    }

    @Test
    fun ordinaryProblems_areNotHazards() {
        assertThat(SafetyGuard.classify("I have a flat tire on the roadside.")).isNull()
        assertThat(SafetyGuard.classify("I cut my finger while chopping vegetables.")).isNull()
        assertThat(SafetyGuard.classify("The alarm is chirping but there is no fire.")).isNull()
    }

    @Test
    fun waterInThePanel_isNotOrdinaryElectrical() {
        val hazard = SafetyGuard.classify("Water is pouring into the breaker panel.")
        assertThat(hazard!!.id).isEqualTo("water_electric")
    }
}
