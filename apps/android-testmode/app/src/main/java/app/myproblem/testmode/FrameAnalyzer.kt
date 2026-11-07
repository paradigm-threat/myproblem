package app.myproblem.testmode

import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import androidx.camera.core.ImageProxy
import java.io.ByteArrayOutputStream
import kotlin.math.max

/**
 * Offline image stats + uniqueness + sparse HSV for L1 color hints.
 * Lightweight — no network, no ML model in MVP.
 */
class FrameAnalyzer {
    private var lastGray: ByteArray? = null
    private var lastW = 0
    private var lastH = 0
    private val worthyHashes = ArrayDeque<Long>()

    fun analyze(image: ImageProxy): ImageStats {
        val w = image.width
        val h = image.height
        val yPlane = image.planes[0]
        val yBuf = yPlane.buffer.duplicate()
        val rowStride = yPlane.rowStride
        val pixelStride = yPlane.pixelStride

        val stepX = max(1, w / 64)
        val stepY = max(1, h / 48)
        val cols = w / stepX
        val rows = h / stepY
        val gray = ByteArray(cols * rows)

        var gi = 0
        var y = 0
        while (y < h) {
            var x = 0
            while (x < w) {
                val idx = y * rowStride + x * pixelStride
                gray[gi++] = yBuf.get(idx)
                x += stepX
            }
            y += stepY
        }

        val (brightness, contrast, glareScore) = ImageStatsMath.meanContrastGlare(gray)
        val lapVar = ImageStatsMath.laplacianVariance(gray, cols, rows)
        val (blurScore, complexity) = ImageStatsMath.blurAndComplexity(lapVar)
        val diffEnergy = ImageStatsMath.frameDiffEnergy(lastGray, gray)
        val hash = ImageStatsMath.averageHash(gray, cols, rows)
        val (hsv, hsvCount) = sampleHsv(image, maxSamples = 96)

        lastGray = gray
        lastW = cols
        lastH = rows

        return ImageStats(
            brightness = brightness,
            contrast = contrast,
            blurScore = blurScore,
            laplacianVar = lapVar,
            complexity = complexity,
            glareScore = glareScore,
            frameDiffEnergy = diffEnergy,
            pHash = hash,
            width = w,
            height = h,
            hsvSamples = hsv,
            hsvSampleCount = hsvCount,
        )
    }

    /**
     * Sparse YUV→HSV grid for color hint scoring.
     */
    private fun sampleHsv(image: ImageProxy, maxSamples: Int): Pair<FloatArray, Int> {
        if (image.planes.size < 3) return floatArrayOf() to 0
        val w = image.width
        val h = image.height
        val yPlane = image.planes[0]
        val uPlane = image.planes[1]
        val vPlane = image.planes[2]
        val yBuf = yPlane.buffer.duplicate()
        val uBuf = uPlane.buffer.duplicate()
        val vBuf = vPlane.buffer.duplicate()
        val yRow = yPlane.rowStride
        val yPix = yPlane.pixelStride
        val uRow = uPlane.rowStride
        val uPix = uPlane.pixelStride
        val vRow = vPlane.rowStride
        val vPix = vPlane.pixelStride

        val grid = 8
        val out = FloatArray(maxSamples * 3)
        var n = 0
        for (gy in 0 until grid) {
            for (gx in 0 until grid) {
                if (n >= maxSamples) break
                val x = ((gx + 0.5f) / grid * w).toInt().coerceIn(0, w - 1)
                val y = ((gy + 0.5f) / grid * h).toInt().coerceIn(0, h - 1)
                val yIdx = y * yRow + x * yPix
                if (yIdx < 0 || yIdx >= yBuf.capacity()) continue
                val Y = yBuf.get(yIdx).toInt() and 0xff
                // 4:2:0 chroma
                val cx = x / 2
                val cy = y / 2
                val uIdx = cy * uRow + cx * uPix
                val vIdx = cy * vRow + cx * vPix
                if (uIdx < 0 || uIdx >= uBuf.capacity() || vIdx < 0 || vIdx >= vBuf.capacity()) continue
                val U = uBuf.get(uIdx).toInt() and 0xff
                val V = vBuf.get(vIdx).toInt() and 0xff
                val rgb = HintScorers.yuvToRgb(Y, U, V)
                HintScorers.rgbToHsv(rgb[0], rgb[1], rgb[2], out, n * 3)
                n++
            }
        }
        return out to n
    }

    fun uniqueDistance(hash: Long): Int = ImageStatsMath.minHammingTo(hash, worthyHashes)

    fun rememberWorthy(hash: Long) {
        worthyHashes.addLast(hash)
        while (worthyHashes.size > 24) worthyHashes.removeFirst()
    }

    fun resetUniqueness() {
        worthyHashes.clear()
        lastGray = null
        lastW = 0
        lastH = 0
    }

    companion object {
        fun yuvToJpeg(image: ImageProxy, quality: Int = 70): ByteArray? {
            if (image.format != ImageFormat.YUV_420_888) return null
            val yBuffer = image.planes[0].buffer
            val uBuffer = image.planes[1].buffer
            val vBuffer = image.planes[2].buffer
            val ySize = yBuffer.remaining()
            val uSize = uBuffer.remaining()
            val vSize = vBuffer.remaining()
            val nv21 = ByteArray(ySize + uSize + vSize)
            yBuffer.get(nv21, 0, ySize)
            vBuffer.get(nv21, ySize, vSize)
            uBuffer.get(nv21, ySize + vSize, uSize)
            val yuv = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
            val out = ByteArrayOutputStream()
            yuv.compressToJpeg(Rect(0, 0, image.width, image.height), quality, out)
            return out.toByteArray()
        }
    }
}
