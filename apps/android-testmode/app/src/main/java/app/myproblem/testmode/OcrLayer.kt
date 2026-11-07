package app.myproblem.testmode

/**
 * OCR **capability** evaluator: does this text satisfy the server's text ask?
 * Pure / JVM-testable — no ML Kit dependency. Orchestration (when to OCR)
 * lives in the ViewModel; this only scores / match / reject.
 */
object OcrLayer {
    fun textHints(request: CaptureRequest?): List<CaptureHint.Text> =
        request?.hints?.filterIsInstance<CaptureHint.Text>().orEmpty()

    fun hasTextHints(request: CaptureRequest?): Boolean = textHints(request).isNotEmpty()

    fun normalize(text: String): String =
        text.lowercase().replace(Regex("\\s+"), " ").trim()

    /**
     * @return Match result for server-send decision.
     * - MATCH: text satisfies hints and is not a previously rejected string
     * - REJECT: readable but wrong / already seen — keep scanning for a *new* image
     * - EMPTY: nothing readable — keep scanning (same or new image)
     */
    fun evaluate(
        request: CaptureRequest?,
        ocrText: String,
        rejectedNormalized: Set<String>,
    ): OcrVerdict {
        val hints = textHints(request)
        if (hints.isEmpty()) {
            return OcrVerdict(OcrOutcome.NO_HINT, textMatch = 1f, message = "")
        }
        val raw = ocrText.trim()
        val norm = normalize(raw)
        if (raw.length < (hints.minOfOrNull { it.minLen } ?: 2)) {
            return OcrVerdict(OcrOutcome.EMPTY, textMatch = 0f, message = "No readable text yet")
        }
        if (norm in rejectedNormalized) {
            return OcrVerdict(
                OcrOutcome.SAME_REJECTED,
                textMatch = 0f,
                message = "Same text as a rejected read — need a different label/image",
                normalized = norm,
                display = raw,
            )
        }
        val allOk =
            hints.all { h ->
                HintScorers.textMatch(h, raw).first
            }
        val score =
            if (allOk) {
                1f
            } else {
                0f
            }
        return if (allOk) {
            OcrVerdict(
                OcrOutcome.MATCH,
                textMatch = score,
                message = "Text matches — would send to server",
                normalized = norm,
                display = raw,
            )
        } else {
            OcrVerdict(
                OcrOutcome.REJECT,
                textMatch = score,
                message = "Text not what we want — keep scanning for a new image",
                normalized = norm,
                display = raw,
            )
        }
    }
}

enum class OcrOutcome {
    NO_HINT,
    EMPTY,
    MATCH,
    REJECT,
    SAME_REJECTED,
}

data class OcrVerdict(
    val outcome: OcrOutcome,
    val textMatch: Float,
    val message: String,
    val normalized: String = "",
    val display: String = "",
)
