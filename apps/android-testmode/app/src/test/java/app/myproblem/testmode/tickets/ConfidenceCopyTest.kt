package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ConfidenceCopyTest {
    @Test
    fun understanding_isAPercent() {
        assertThat(ConfidenceCopy.understanding(45)).isEqualTo("Understanding 45%")
    }

    @Test
    fun solution_staysBlankUntilTheProblemIsSpecific() {
        assertThat(ConfidenceCopy.solution(null, "understand")).contains("still learning")
    }

    @Test
    fun solution_stopsAdvisingBelowTheLine() {
        assertThat(ConfidenceCopy.solution(28, "batch")).contains("not confident enough")
        assertThat(ConfidenceCopy.solution(28, "human")).contains("person should continue")
    }
}
