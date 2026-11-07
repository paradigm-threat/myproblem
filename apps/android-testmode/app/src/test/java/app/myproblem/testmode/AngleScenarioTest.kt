package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class AngleScenarioTest {
    @Test
    fun sectorFromYaw_coversEightBuckets() {
        val seen = mutableSetOf<Int>()
        for (yaw in -180..179 step 5) {
            val id = AngleScenario.sectorFromYaw(yaw.toFloat())
            assertThat(id).isAtLeast(0)
            assertThat(id).isLessThan(AngleScenario.SECTOR_COUNT)
            seen.add(id)
        }
        assertThat(seen).hasSize(AngleScenario.SECTOR_COUNT)
    }

    @Test
    fun nameFor_matchesIndex() {
        assertThat(AngleScenario.nameFor(0)).isEqualTo("N")
        assertThat(AngleScenario.nameFor(4)).isEqualTo("S")
        assertThat(AngleScenario.nameFor(99)).isEqualTo("?")
    }
}
