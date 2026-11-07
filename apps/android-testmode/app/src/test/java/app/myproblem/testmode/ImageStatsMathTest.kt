package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ImageStatsMathTest {
    @Test
    fun averageHash_identicalImages_zeroHamming() {
        val gray = ByteArray(64 * 48) { (it % 200).toByte() }
        val a = ImageStatsMath.averageHash(gray, 64, 48)
        val b = ImageStatsMath.averageHash(gray, 64, 48)
        assertThat(ImageStatsMath.hammingDistance(a, b)).isEqualTo(0)
    }

    @Test
    fun averageHash_oppositePatterns_farApart() {
        val dark = ByteArray(64 * 48) { 10 }
        val bright = ByteArray(64 * 48) { 240.toByte() }
        // half-half checker vs flat — ensure uniqueness helper works
        val left = ByteArray(64 * 48) { i -> if (i % 64 < 32) 10 else 240.toByte() }
        val hDark = ImageStatsMath.averageHash(dark, 64, 48)
        val hLeft = ImageStatsMath.averageHash(left, 64, 48)
        assertThat(ImageStatsMath.hammingDistance(hDark, hLeft)).isAtLeast(8)
    }

    @Test
    fun minHammingTo_empty_is64() {
        assertThat(ImageStatsMath.minHammingTo(1L, emptyList())).isEqualTo(64)
    }

    @Test
    fun blurAndComplexity_sharpLaplacian_lowBlur() {
        val (blur, cx) = ImageStatsMath.blurAndComplexity(5000f)
        assertThat(blur).isLessThan(0.1f)
        assertThat(cx).isGreaterThan(0.9f)
    }

    @Test
    fun frameDiffEnergy_identical_isZero() {
        val g = ByteArray(100) { 50 }
        assertThat(ImageStatsMath.frameDiffEnergy(g, g.copyOf())).isEqualTo(0f)
    }

    @Test
    fun meanContrastGlare_uniformMidGray() {
        val g = ByteArray(100) { 128.toByte() }
        val (b, c, glare) = ImageStatsMath.meanContrastGlare(g)
        assertThat(b).isWithin(0.02f).of(128f / 255f)
        assertThat(c).isWithin(0.01f).of(0f)
        assertThat(glare).isEqualTo(0f)
    }
}
