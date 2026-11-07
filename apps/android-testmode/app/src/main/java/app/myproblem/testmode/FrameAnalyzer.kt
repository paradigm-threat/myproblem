package app.myproblem.testmode

import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import androidx.camera.core.ImageProxy
import java.io.ByteArrayOutputStream
import kotlin.math.max

/**
 * Offline image stats + uniqueness. Lightweight — no network, no ML model in MVP.
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
        val yBuf = yPlane.buffer
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
        )
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
