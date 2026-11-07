package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class OcrLayerTest {
    private val req = CaptureRequest.requireTextDemo("SERIAL")

    @Test
    fun match_whenContainsTarget() {
        val v = OcrLayer.evaluate(req, "Device SERIAL 42", emptySet())
        assertThat(v.outcome).isEqualTo(OcrOutcome.MATCH)
    }

    @Test
    fun reject_whenWrongText() {
        val v = OcrLayer.evaluate(req, "MODEL ONLY", emptySet())
        assertThat(v.outcome).isEqualTo(OcrOutcome.REJECT)
        assertThat(v.normalized).isEqualTo("model only")
    }

    @Test
    fun sameRejected_blocksResend() {
        val rejected = setOf("model only")
        val v = OcrLayer.evaluate(req, "MODEL ONLY", rejected)
        assertThat(v.outcome).isEqualTo(OcrOutcome.SAME_REJECTED)
    }

    @Test
    fun empty_whenBlank() {
        val v = OcrLayer.evaluate(req, "  ", emptySet())
        assertThat(v.outcome).isEqualTo(OcrOutcome.EMPTY)
    }

    @Test
    fun noHint_passthrough() {
        val v = OcrLayer.evaluate(null, "anything", emptySet())
        assertThat(v.outcome).isEqualTo(OcrOutcome.NO_HINT)
    }
}
