package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class UniqueFramePolicyTest {
    @Test
    fun keepsASendFrame() {
        assertThat(UniqueFramePolicy.shouldKeep(Decision.SEND, 0, 1_000L, 0L)).isTrue()
    }

    @Test
    fun skipsDropsAndTheGapAfterAKeep() {
        assertThat(UniqueFramePolicy.shouldKeep(Decision.DROP, 0, 1_000L, 0L)).isFalse()
        assertThat(UniqueFramePolicy.shouldKeep(Decision.SEND, 1, 1_500L, 1_000L)).isFalse()
        assertThat(UniqueFramePolicy.shouldKeep(Decision.SEND, 1, 1_900L, 1_000L)).isTrue()
    }

    @Test
    fun stopsAfterThree() {
        assertThat(UniqueFramePolicy.shouldKeep(Decision.SEND, UniqueFramePolicy.MAX_KEPT, 9_000L, 1_000L)).isFalse()
    }
}
