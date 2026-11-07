package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class HintScorersTest {
    private fun hsvGrid(h: Float, s: Float, v: Float, n: Int = 16): Pair<FloatArray, Int> {
        val out = FloatArray(n * 3)
        for (i in 0 until n) {
            out[i * 3] = h
            out[i * 3 + 1] = s
            out[i * 3 + 2] = v
        }
        return out to n
    }

    @Test
    fun colorFraction_hitsBlue() {
        val (samples, n) = hsvGrid(210f, 0.5f, 0.5f)
        val frac =
            HintScorers.colorFraction(
                samples,
                n,
                targetH = 210f,
                targetS = 0.45f,
                targetV = 0.4f,
                tolH = 25f,
                tolS = 0.4f,
                tolV = 0.5f,
            )
        assertThat(frac).isEqualTo(1f)
    }

    @Test
    fun colorFraction_missesRedWhenWantBlue() {
        val (samples, n) = hsvGrid(10f, 0.8f, 0.6f)
        val frac =
            HintScorers.colorFraction(
                samples,
                n,
                targetH = 210f,
                targetS = 0.45f,
                targetV = 0.4f,
                tolH = 25f,
                tolS = 0.4f,
                tolV = 0.5f,
            )
        assertThat(frac).isEqualTo(0f)
    }

    @Test
    fun requireBlue_passesOnBlueSamples() {
        val (samples, n) = hsvGrid(205f, 0.5f, 0.45f)
        val scores =
            HintScorers.score(
                request = CaptureRequest.requireBlueDemo(),
                hsvSamples = samples,
                sampleCount = n,
                yawDeg = 0f,
                sectorName = "N",
                blobAspect = null,
            )
        assertThat(scores.passed).isTrue()
        assertThat(scores.colorMatch).isGreaterThan(0.9f)
    }

    @Test
    fun requireBlue_failsOnGray() {
        val (samples, n) = hsvGrid(0f, 0.05f, 0.4f)
        val scores =
            HintScorers.score(
                request = CaptureRequest.requireBlueDemo(),
                hsvSamples = samples,
                sampleCount = n,
                yawDeg = 0f,
                sectorName = "N",
                blobAspect = null,
            )
        assertThat(scores.passed).isFalse()
        assertThat(scores.failLabel).contains("color")
    }

    @Test
    fun angle_sectorMatch() {
        val scores =
            HintScorers.score(
                request = CaptureRequest.requireSectorDemo("NE"),
                hsvSamples = null,
                sampleCount = 0,
                yawDeg = 45f,
                sectorName = "NE",
                blobAspect = null,
            )
        assertThat(scores.passed).isTrue()
    }

    @Test
    fun angle_sectorMiss() {
        val scores =
            HintScorers.score(
                request = CaptureRequest.requireSectorDemo("NE"),
                hsvSamples = null,
                sampleCount = 0,
                yawDeg = 180f,
                sectorName = "S",
                blobAspect = null,
            )
        assertThat(scores.passed).isFalse()
    }

    @Test
    fun shape_aspectWithinTol() {
        val req =
            CaptureRequest(
                id = "cr_shape",
                hints = listOf(CaptureHint.Shape(aspect = 1.6f, tol = 0.25f)),
            )
        val ok =
            HintScorers.score(
                request = req,
                hsvSamples = null,
                sampleCount = 0,
                yawDeg = 0f,
                sectorName = "N",
                blobAspect = 1.5f,
            )
        assertThat(ok.passed).isTrue()
        val bad =
            HintScorers.score(
                request = req,
                hsvSamples = null,
                sampleCount = 0,
                yawDeg = 0f,
                sectorName = "N",
                blobAspect = 3.0f,
            )
        assertThat(bad.passed).isFalse()
    }

    @Test
    fun rgbToHsv_blue() {
        val out = FloatArray(3)
        HintScorers.rgbToHsv(0f, 0f, 1f, out, 0)
        assertThat(out[0]).isWithin(1f).of(240f)
        assertThat(out[1]).isWithin(0.01f).of(1f)
        assertThat(out[2]).isWithin(0.01f).of(1f)
    }

    @Test
    fun hueDistance_wraps() {
        assertThat(HintScorers.hueDistance(10f, 350f)).isWithin(0.1f).of(20f)
    }
}
