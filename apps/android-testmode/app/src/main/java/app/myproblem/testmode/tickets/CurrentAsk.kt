package app.myproblem.testmode.tickets

/**
 * The one sentence on the capture screen. A safety stop wins over a request
 * to look closer. The server ask wins once a pull has stored it.
 */
object CurrentAsk {
    const val OPENING = "What is happening, in one sentence?"
    const val KEEP_SHOWING = "Keep showing the problem, or stop when you are done."
    const val ANSWER_BY_TALKING = "Answer by talking"

    /** Top to bottom on the capture screen. The question is not drawn on the preview. */
    val sectionOrder = listOf("question", "preview")

    fun questionIsAbovePreview(): Boolean =
        sectionOrder.indexOf("question") < sectionOrder.indexOf("preview")

    /**
     * Bands the capture screen draws, top to bottom. The server line appears
     * only when Intake is slow or unreachable, and it stays off the preview.
     */
    fun captureChrome(ticket: LocalTicket, nowMs: Long = System.currentTimeMillis()): List<String> {
        val bands = mutableListOf("question")
        if (ticket.sync.serverBanner(nowMs) != null) bands += "server"
        bands += "preview"
        return bands
    }

    /** A later still must not replace a server question or a safety warning. */
    fun shouldKeep(ticket: LocalTicket): Boolean =
        ticket.currentAsk.isNotBlank() || ticket.coachLine.startsWith("Safety warning")

    fun pick(text: String, serverAsk: String?, visionAsk: String?): String {
        val hazard = SafetyGuard.classify(text)
        if (hazard != null) return hazard.questions.first()
        if (!serverAsk.isNullOrBlank()) return serverAsk
        if (!visionAsk.isNullOrBlank()) return visionAsk
        return OPENING
    }

    fun forTicket(ticket: LocalTicket): String {
        val vision = ticket.questions.firstOrNull { it.contains("photo of", ignoreCase = true) }
        return pick(
            text = "${ticket.displayTitle()}\n${ticket.displayDescription()}",
            serverAsk = ticket.currentAsk.takeIf { it.isNotBlank() },
            visionAsk = vision,
        )
    }
}
