package app.myproblem.testmode

/**
 * Human-readable event log: only transitions + sustained problems — not every frame.
 * JVM-testable; no Android deps.
 */
enum class CoachKind {
    INFO,
    NEW,
    WARN,
    OK,
}

data class CoachLogEntry(
    val id: Long,
    val tsMs: Long,
    val kind: CoachKind,
    val message: String,
)

class CoachEventTracker(
    private val sustainMs: Long = 1_000L,
    private val sameSceneMs: Long = 1_500L,
    private val maxEntries: Int = 48,
) {
    private var nextId = 1L
    private val entries = ArrayDeque<CoachLogEntry>()

    private var activeReason: DropReason? = null
    private var reasonSinceMs: Long = 0L
    private var sustainedEmittedFor: DropReason? = null

    private var lastWorthySector: String? = null
    private var wasBlurry = false

    fun reset() {
        entries.clear()
        activeReason = null
        reasonSinceMs = 0L
        sustainedEmittedFor = null
        lastWorthySector = null
        wasBlurry = false
    }

    fun snapshot(): List<CoachLogEntry> = entries.toList()

    /** Call once per analysis decision. Returns newly appended entries (may be empty). */
    fun onPacket(packet: ContextPacket, nowMs: Long = packet.tsMs): List<CoachLogEntry> {
        val fresh = ArrayList<CoachLogEntry>(2)

        if (packet.decision == Decision.KEEP || packet.decision == Decision.SEND) {
            if (packet.decision == Decision.KEEP) {
                fresh +=
                    append(
                        nowMs,
                        CoachKind.NEW,
                        "New clear view · sector ${packet.sectorName} — running OCR…",
                    )
            } else if (packet.sendReady) {
                val textBit =
                    if (packet.ocrText.isNotBlank()) {
                        " · \"${packet.ocrText.take(40)}\""
                    } else {
                        ""
                    }
                fresh +=
                    append(
                        nowMs,
                        CoachKind.NEW,
                        "Ask satisfied — would send · sector ${packet.sectorName}$textBit",
                    )
            }
            if (wasBlurry) {
                fresh += append(nowMs, CoachKind.OK, "Focus looks good again")
                wasBlurry = false
            }
            activeReason = null
            sustainedEmittedFor = null
            lastWorthySector = packet.sectorName
            return fresh
        }

        val reason = packet.dropReason
        when {
            activeReason != reason -> {
                activeReason = reason
                reasonSinceMs = nowMs
                sustainedEmittedFor = null
                if (reason != DropReason.BLUR) {
                    // leaving blur without a worthy still clears blur flag on sustained recovery paths below
                }
            }
            else -> {
                val held = nowMs - reasonSinceMs
                if (sustainedEmittedFor != reason && held >= sustainThreshold(reason)) {
                    sustainedMessage(reason, packet)?.let { msg ->
                        fresh += append(nowMs, CoachKind.WARN, msg)
                        sustainedEmittedFor = reason
                        if (reason == DropReason.BLUR) wasBlurry = true
                    }
                }
            }
        }

        // Recovery: left blur for a non-blur drop (e.g. duplicate after focusing)
        if (wasBlurry && reason != DropReason.BLUR && reason != DropReason.MOTION) {
            fresh += append(nowMs, CoachKind.OK, "Focus looks good again")
            wasBlurry = false
        }

        return fresh
    }

    fun onFeed(on: Boolean, nowMs: Long): List<CoachLogEntry> {
        resetSustain()
        return listOf(
            append(
                nowMs,
                CoachKind.INFO,
                if (on) "Feed on — watching for a new clear view" else "Feed off",
            ),
        )
    }

    fun onHint(mode: DebugHintMode, coach: String?, nowMs: Long): List<CoachLogEntry> {
        val msg =
            when (mode) {
                DebugHintMode.OFF -> "Hint cleared — any unique clear frame counts"
                DebugHintMode.REQUIRE_BLUE -> "Hint: need blue in frame — ${coach ?: "get more blue"}"
                DebugHintMode.REQUIRE_SECTOR_NE -> "Hint: face NE — ${coach ?: "turn to NE"}"
                DebugHintMode.REQUIRE_TEXT -> "Hint: OCR — ${coach ?: "point at readable text"}"
            }
        return listOf(append(nowMs, CoachKind.INFO, msg))
    }

    fun onReset(nowMs: Long): List<CoachLogEntry> {
        reset()
        return listOf(append(nowMs, CoachKind.INFO, "Session reset — ready for a new image"))
    }

    fun onOcrVerdict(verdict: OcrVerdict, nowMs: Long): List<CoachLogEntry> {
        val preview =
            if (verdict.display.length > 60) verdict.display.take(57) + "…" else verdict.display
        return when (verdict.outcome) {
            OcrOutcome.MATCH ->
                listOf(
                    append(nowMs, CoachKind.NEW, "OCR match — would send: \"$preview\""),
                )
            OcrOutcome.REJECT ->
                listOf(
                    append(
                        nowMs,
                        CoachKind.WARN,
                        "OCR reject \"$preview\" — find a new image (not this text)",
                    ),
                )
            OcrOutcome.SAME_REJECTED ->
                listOf(
                    append(nowMs, CoachKind.WARN, "OCR same rejected text — keep panning"),
                )
            OcrOutcome.EMPTY ->
                listOf(
                    append(nowMs, CoachKind.WARN, "Kept frame but no readable text — try closer"),
                )
            OcrOutcome.NO_HINT -> emptyList()
        }
    }

    private fun sustainThreshold(reason: DropReason): Long =
        when (reason) {
            DropReason.DUPLICATE -> sameSceneMs
            else -> sustainMs
        }

    private fun sustainedMessage(reason: DropReason, packet: ContextPacket): String? =
        when (reason) {
            DropReason.BLUR -> "Out of focus for 1s+ — hold still or move closer"
            DropReason.MOTION -> "Shaking for 1s+ — brace the phone"
            DropReason.DARK -> "Too dark for 1s+ — add light or face a brighter area"
            DropReason.BRIGHT -> "Too bright for 1s+ — reduce glare / tilt away from lights"
            DropReason.GLARE -> "Glare for 1s+ — angle away from reflections"
            DropReason.DUPLICATE ->
                "Same scene still in view" +
                    (lastWorthySector?.let { " (last new: $it)" } ?: "") +
                    " — pan or change angle for something new"
            DropReason.WRONG_ANGLE ->
                "Already captured ${packet.sectorName} — turn to an empty sector"
            DropReason.WRONG_TARGET ->
                packet.coach.ifBlank {
                    "Hint miss (${packet.hintFailLabel.ifBlank { "target" }}) for 1s+ — adjust framing"
                }
            DropReason.WRONG_TEXT ->
                "Wrong / missing text for 1s+ — pan to a different label or plate"
            DropReason.SAME_TEXT ->
                "Same rejected text for 1s+ — need a new image with different text"
            DropReason.OCR_PENDING, DropReason.FEED_OFF, DropReason.NONE -> null
        }

    private fun resetSustain() {
        activeReason = null
        reasonSinceMs = 0L
        sustainedEmittedFor = null
    }

    private fun append(tsMs: Long, kind: CoachKind, message: String): CoachLogEntry {
        val e = CoachLogEntry(id = nextId++, tsMs = tsMs, kind = kind, message = message)
        entries.addFirst(e)
        while (entries.size > maxEntries) entries.removeLast()
        return e
    }
}
