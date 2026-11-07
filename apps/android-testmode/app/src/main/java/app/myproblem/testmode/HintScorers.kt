package app.myproblem.testmode

import kotlin.math.abs
import kotlin.math.min

/** Pure L1 hint scorers — JVM-testable. */
object HintScorers {
    /**
     * @param includeTextHints when false, skip Text (OCR is a separate capability —
     * see [OcrLayer]). Color/angle/shape still apply.
     */
    fun score(
        request: CaptureRequest?,
        hsvSamples: FloatArray?,
        sampleCount: Int,
        yawDeg: Float,
        sectorName: String,
        blobAspect: Float?,
        ocrText: String = "",
        colorMinFractionDefault: Float = 0.04f,
        includeTextHints: Boolean = false,
    ): HintScores {
        if (request == null || !request.isActive) {
            return HintScores()
        }

        val results = ArrayList<Pair<Boolean, String>>(request.hints.size)
        var colorMatch = 1f
        var shapeMatch = 1f
        var textMatch = 1f
        var poseErr = 0f

        for (hint in request.hints) {
            when (hint) {
                is CaptureHint.Color -> {
                    val minFrac = maxOf(hint.minFraction, colorMinFractionDefault)
                    val frac =
                        colorFraction(
                            hsvSamples = hsvSamples,
                            sampleCount = sampleCount,
                            targetH = hint.h,
                            targetS = hint.s,
                            targetV = hint.v,
                            tolH = hint.tolH,
                            tolS = hint.tolS,
                            tolV = hint.tolV,
                        )
                    colorMatch = min(colorMatch, frac / minFrac.coerceAtLeast(1e-4f)).coerceIn(0f, 1f)
                    val ok = frac >= minFrac
                    results += ok to if (ok) "" else "color:${hint.label.ifBlank { "target" }}"
                }
                is CaptureHint.Shape -> {
                    if (blobAspect == null) {
                        shapeMatch = 0f
                        results += false to "shape:no_aspect"
                    } else {
                        val err = abs(blobAspect - hint.aspect) / hint.aspect.coerceAtLeast(1e-3f)
                        val score = (1f - err / hint.tol.coerceAtLeast(1e-3f)).coerceIn(0f, 1f)
                        shapeMatch = min(shapeMatch, score)
                        val ok = err <= hint.tol
                        results += ok to if (ok) "" else "shape:aspect"
                    }
                }
                is CaptureHint.Angle -> {
                    val (ok, err) = angleMatch(hint, yawDeg, sectorName)
                    poseErr = maxOf(poseErr, err)
                    results += ok to if (ok) "" else "angle"
                }
                is CaptureHint.Text -> {
                    if (!includeTextHints) {
                        continue
                    }
                    val (ok, score) = textMatch(hint, ocrText)
                    textMatch = min(textMatch, score)
                    results += ok to if (ok) "" else "text"
                }
            }
        }
        if (results.isEmpty() && request.hints.all { it is CaptureHint.Text } && !includeTextHints) {
            return HintScores()
        }

        val passed =
            when (request.logic) {
                HintLogic.ALL -> results.all { it.first }
                HintLogic.ANY -> results.any { it.first }
            }
        val failLabel = results.firstOrNull { !it.first }?.second.orEmpty()
        return HintScores(
            colorMatch = colorMatch,
            shapeMatch = shapeMatch,
            textMatch = textMatch,
            poseErrDeg = poseErr,
            passed = passed,
            failLabel = failLabel,
        )
    }

    fun textMatch(hint: CaptureHint.Text, ocrText: String): Pair<Boolean, Float> {
        val t = ocrText.trim()
        if (t.length < hint.minLen) return false to 0f
        if (hint.contains.isBlank()) return true to 1f
        val ok = t.contains(hint.contains, ignoreCase = true)
        return ok to if (ok) 1f else 0f
    }

    fun colorFraction(
        hsvSamples: FloatArray?,
        sampleCount: Int,
        targetH: Float,
        targetS: Float,
        targetV: Float,
        tolH: Float,
        tolS: Float,
        tolV: Float,
    ): Float {
        if (hsvSamples == null || sampleCount <= 0) return 0f
        var hits = 0
        var i = 0
        repeat(sampleCount) {
            val h = hsvSamples[i]
            val s = hsvSamples[i + 1]
            val v = hsvSamples[i + 2]
            i += 3
            if (hueDistance(h, targetH) <= tolH &&
                abs(s - targetS) <= tolS &&
                abs(v - targetV) <= tolV
            ) {
                hits++
            }
        }
        return hits.toFloat() / sampleCount
    }

    fun hueDistance(a: Float, b: Float): Float {
        val d = abs(a - b) % 360f
        return min(d, 360f - d)
    }

    fun angleMatch(
        hint: CaptureHint.Angle,
        yawDeg: Float,
        sectorName: String,
    ): Pair<Boolean, Float> {
        hint.sector?.let { want ->
            if (want.equals(sectorName, ignoreCase = true)) {
                return true to 0f
            }
            // Sector miss: approximate error as half sector width
            return false to 22.5f
        }
        val target = hint.orYawDeg ?: return true to 0f
        val err = yawDistance(yawDeg, target)
        return (err <= hint.tolDeg) to err
    }

    fun yawDistance(a: Float, b: Float): Float {
        val d = abs(((a - b) % 360f + 540f) % 360f - 180f)
        return d
    }

    /** RGB 0–1 → HSV (H 0–360, S/V 0–1). Packed into out[offset..offset+2]. */
    fun rgbToHsv(r: Float, g: Float, b: Float, out: FloatArray, offset: Int) {
        val max = maxOf(r, g, b)
        val min = minOf(r, g, b)
        val delta = max - min
        val h =
            when {
                delta < 1e-6f -> 0f
                max == r -> (60f * (((g - b) / delta) % 6f) + 360f) % 360f
                max == g -> (60f * ((b - r) / delta + 2f) + 360f) % 360f
                else -> (60f * ((r - g) / delta + 4f) + 360f) % 360f
            }
        val s = if (max < 1e-6f) 0f else delta / max
        out[offset] = h
        out[offset + 1] = s
        out[offset + 2] = max
    }

    /** Approximate BT.601 YUV (full-range-ish) → RGB 0–1. */
    fun yuvToRgb(y: Int, u: Int, v: Int): FloatArray {
        val Y = y.toFloat()
        val U = u - 128f
        val V = v - 128f
        val r = (Y + 1.402f * V).coerceIn(0f, 255f) / 255f
        val g = (Y - 0.344136f * U - 0.714136f * V).coerceIn(0f, 255f) / 255f
        val b = (Y + 1.772f * U).coerceIn(0f, 255f) / 255f
        return floatArrayOf(r, g, b)
    }
}
