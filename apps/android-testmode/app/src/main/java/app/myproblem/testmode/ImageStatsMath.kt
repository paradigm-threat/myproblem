package app.myproblem.testmode

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/** Pure image stats on a downsampled grayscale buffer — JVM-testable. */
object ImageStatsMath {
    fun meanContrastGlare(gray: ByteArray): Triple<Float, Float, Float> {
        if (gray.isEmpty()) return Triple(0f, 0f, 0f)
        var sum = 0L
        var sumSq = 0L
        var glare = 0
        for (b in gray) {
            val v = b.toInt() and 0xff
            sum += v
            sumSq += v.toLong() * v
            if (v >= 245) glare++
        }
        val n = gray.size
        val mean = sum.toFloat() / n
        val variance = (sumSq.toFloat() / n) - mean * mean
        val contrast = sqrt(max(0f, variance))
        val glareScore = glare.toFloat() / n
        return Triple(mean / 255f, (contrast / 128f).coerceIn(0f, 1f), glareScore)
    }

    fun laplacianVariance(gray: ByteArray, cols: Int, rows: Int): Float {
        if (cols < 3 || rows < 3) return 0f
        var sum = 0.0
        var sumSq = 0.0
        var n = 0
        for (r in 1 until rows - 1) {
            for (c in 1 until cols - 1) {
                val i = r * cols + c
                val lap =
                    (gray[i - cols].toInt() and 0xff) +
                        (gray[i + cols].toInt() and 0xff) +
                        (gray[i - 1].toInt() and 0xff) +
                        (gray[i + 1].toInt() and 0xff) -
                        4 * (gray[i].toInt() and 0xff)
                sum += lap
                sumSq += lap.toDouble() * lap
                n++
            }
        }
        if (n == 0) return 0f
        val mean = sum / n
        return (sumSq / n - mean * mean).toFloat().coerceAtLeast(0f)
    }

    fun blurAndComplexity(laplacianVar: Float): Pair<Float, Float> {
        val blur = (1f - (laplacianVar / (laplacianVar + 80f))).coerceIn(0f, 1f)
        val complexity = (laplacianVar / (laplacianVar + 40f)).coerceIn(0f, 1f)
        return blur to complexity
    }

    fun frameDiffEnergy(prev: ByteArray?, gray: ByteArray): Float {
        if (prev == null || prev.size != gray.size) return if (prev == null) 0f else 1f
        var sum = 0L
        for (i in gray.indices) {
            sum += abs((gray[i].toInt() and 0xff) - (prev[i].toInt() and 0xff))
        }
        return (sum.toFloat() / (gray.size * 255f)).coerceIn(0f, 1f)
    }

    fun averageHash(gray: ByteArray, cols: Int, rows: Int): Long {
        val cellW = max(1, cols / 8)
        val cellH = max(1, rows / 8)
        val means = FloatArray(64)
        for (by in 0 until 8) {
            for (bx in 0 until 8) {
                var s = 0
                var cnt = 0
                val y0 = by * cellH
                val x0 = bx * cellW
                for (y in y0 until min(rows, y0 + cellH)) {
                    for (x in x0 until min(cols, x0 + cellW)) {
                        s += gray[y * cols + x].toInt() and 0xff
                        cnt++
                    }
                }
                means[by * 8 + bx] = if (cnt > 0) s.toFloat() / cnt else 0f
            }
        }
        val avg = means.average().toFloat()
        var hash = 0L
        for (i in 0 until 64) {
            if (means[i] >= avg) hash = hash or (1L shl i)
        }
        return hash
    }

    fun hammingDistance(a: Long, b: Long): Int = java.lang.Long.bitCount(a xor b)

    fun minHammingTo(hash: Long, previous: Collection<Long>): Int {
        if (previous.isEmpty()) return 64
        var best = 64
        for (h in previous) {
            best = min(best, hammingDistance(hash, h))
        }
        return best
    }
}
