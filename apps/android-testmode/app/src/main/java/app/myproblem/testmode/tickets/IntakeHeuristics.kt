package app.myproblem.testmode.tickets

/**
 * Local stand-in for server intake until APIs exist.
 * Prefer stills/title signal; otherwise ask for manual text.
 */
object IntakeHeuristics {
    fun decide(ticket: LocalTicket): IntakeDecision {
        val titleOk =
            ticket.displayTitle().isNotBlank() &&
                !ticket.displayTitle().equals("New problem", ignoreCase = true) &&
                !ticket.displayTitle().equals("Listening…", ignoreCase = true) &&
                ticket.displayTitle().length >= 3
        val descOk = ticket.displayDescription().isNotBlank() && ticket.displayDescription().length >= 8
        val stillsOk = ticket.stillCount > 0
        val audioOk = ticket.hasAudio

        return when {
            stillsOk && !titleOk && !descOk && !audioOk ->
                IntakeDecision(
                    intake = IntakeStatus.NAMED_AND_QUESTIONS,
                    title = "Problem in photo",
                    summary = "We see something in your stills — confirm what you need help with.",
                    questions =
                        listOf(
                            "What went wrong?",
                            "Is anyone at risk right now?",
                            "Do you have tools or a spare nearby?",
                        ),
                    advice = null,
                )
            stillsOk && (titleOk || descOk || audioOk) ->
                IntakeDecision(
                    intake = IntakeStatus.ADVICE_READY,
                    title = if (titleOk) ticket.displayTitle() else "Photo problem",
                    summary = "Enough to suggest first steps. Deeper investigation can still be queued.",
                    questions = emptyList(),
                    advice =
                        "1. Stay safe — move out of traffic or hazards.\n" +
                            "2. Capture a clear label / damage close-up if you have not.\n" +
                            "3. Note what you already tried.",
                )
            titleOk && (descOk || audioOk) ->
                IntakeDecision(
                    intake = IntakeStatus.QUEUE_PROJECT,
                    title = ticket.displayTitle(),
                    summary = "Packaged — queuing a deeper look when capacity frees.",
                    questions = emptyList(),
                    advice = null,
                )
            titleOk ->
                IntakeDecision(
                    intake = IntakeStatus.NAMED_AND_QUESTIONS,
                    title = ticket.displayTitle(),
                    summary = "Got a title. A bit more detail will help.",
                    questions =
                        listOf(
                            "What have you already tried?",
                            "When did this start?",
                        ),
                    advice = null,
                )
            audioOk && !titleOk && !descOk ->
                IntakeDecision(
                    intake = IntakeStatus.NEEDS_USER_TEXT,
                    title = ticket.displayTitle(),
                    summary = "Voice captured — add a short title so we can file this.",
                    questions = emptyList(),
                    advice = null,
                )
            else ->
                IntakeDecision(
                    intake = IntakeStatus.NEEDS_USER_TEXT,
                    title = ticket.displayTitle(),
                    summary = "Not enough yet — add a title and what you need.",
                    questions = emptyList(),
                    advice = null,
                )
        }
    }
}

data class IntakeDecision(
    val intake: IntakeStatus,
    val title: String,
    val summary: String,
    val questions: List<String>,
    val advice: String?,
)
