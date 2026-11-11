package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

/**
 * Same synthetic stills as fixtures/photos/catalog.json. Asserts the on-device
 * stats that feed ContextBuilder, without a vision model.
 */
class PhotoAnalysisTest {
    private val cols = 64
    private val rows = 48

    @Test
    fun sharpStripes_areNotBlurryOrGlared() {
        val stats = stats("vertical_stripes")
        assertThat(stats.blur).isLessThan(ContextBuilder.BLUR_DROP)
        assertThat(stats.glare).isLessThan(ContextBuilder.GLARE_DROP)
        assertThat(stats.brightness).isGreaterThan(ContextBuilder.DARK_MAX)
        assertThat(stats.brightness).isLessThan(ContextBuilder.BRIGHT_MIN)
    }

    @Test
    fun softRamp_isBlur() {
        val stats = stats("soft_ramp")
        assertThat(stats.blur).isAtLeast(ContextBuilder.BLUR_DROP)
    }

    @Test
    fun glareChecker_isGlareAndStillSharp() {
        val stats = stats("checker_glare")
        assertThat(stats.blur).isLessThan(ContextBuilder.BLUR_DROP)
        assertThat(stats.glare).isAtLeast(ContextBuilder.GLARE_DROP)
        assertThat(stats.brightness).isLessThan(ContextBuilder.BRIGHT_MIN)
    }

    @Test
    fun darkChecker_isSharpAndDark() {
        val stats = stats("checker_dark")
        assertThat(stats.blur).isLessThan(ContextBuilder.BLUR_DROP)
        assertThat(stats.brightness).isAtMost(ContextBuilder.DARK_MAX)
    }

    @Test
    fun brightChecker_isSharpAndBrightWithoutHotPixels() {
        val stats = stats("checker_bright")
        assertThat(stats.blur).isLessThan(ContextBuilder.BLUR_DROP)
        assertThat(stats.glare).isLessThan(ContextBuilder.GLARE_DROP)
        assertThat(stats.brightness).isAtLeast(ContextBuilder.BRIGHT_MIN)
    }

    @Test
    fun identicalHold_isDuplicate() {
        val a = render("vertical_stripes")
        val h1 = ImageStatsMath.averageHash(a, cols, rows)
        val h2 = ImageStatsMath.averageHash(a, cols, rows)
        assertThat(ImageStatsMath.hammingDistance(h1, h2)).isLessThan(8)
    }

    @Test
    fun leftRight_isFarFromStripes() {
        val stripes = ImageStatsMath.averageHash(render("vertical_stripes"), cols, rows)
        val split = ImageStatsMath.averageHash(render("left_right"), cols, rows)
        assertThat(ImageStatsMath.hammingDistance(stripes, split)).isAtLeast(8)
    }

    private data class Measured(val brightness: Float, val blur: Float, val glare: Float)

    private fun stats(name: String): Measured {
        val gray = render(name)
        val (brightness, _, glare) = ImageStatsMath.meanContrastGlare(gray)
        val lap = ImageStatsMath.laplacianVariance(gray, cols, rows)
        val (blur, _) = ImageStatsMath.blurAndComplexity(lap)
        return Measured(brightness, blur, glare)
    }

    private fun render(name: String): ByteArray {
        val gray = ByteArray(cols * rows)
        for (y in 0 until rows) {
            for (x in 0 until cols) {
                val v = when (name) {
                    "vertical_stripes" -> if (x % 2 == 0) 40 else 180
                    "soft_ramp" -> (40 + (140.0 * x) / (cols - 1)).toInt()
                    "checker_glare" -> if ((x + y) % 2 == 0) 255 else 80
                    "checker_dark" -> if ((x + y) % 2 == 0) 0 else 30
                    "checker_bright" -> if ((x + y) % 2 == 0) 244 else 235
                    "left_right" -> if (x < cols / 2) 20 else 200
                    else -> error("unknown pattern $name")
                }
                gray[y * cols + x] = v.toByte()
            }
        }
        return gray
    }
}
