package app.myproblem.testmode.tickets

enum class TicketStepState {
    DONE,
    CURRENT,
    LATER,
}

data class TicketStatusStep(
    val id: String,
    val label: String,
    val state: TicketStepState,
)

data class TicketPageStatus(
    val pill: String,
    val summary: String,
    val steps: List<TicketStatusStep>,
) {
    companion object {
        /**
         * Same words as the public ticket page. An open ticket is submitted
         * and waiting. It does not claim a fix plan. Solved completes the list.
         */
        fun of(solved: Boolean): TicketPageStatus {
            if (solved) {
                return TicketPageStatus(
                    pill = "Solved",
                    summary = "This problem is marked solved.",
                    steps =
                        listOf(
                            step("submitted", "Submitted", TicketStepState.DONE),
                            step("ai", "AI review", TicketStepState.DONE),
                            step("people", "People", TicketStepState.DONE),
                            step("plan", "Fix plan", TicketStepState.DONE),
                            step("solved", "Solved", TicketStepState.DONE),
                        ),
                )
            }
            return TicketPageStatus(
                pill = "Awaiting review",
                summary = "Submitted. Waiting for the AI pass and for people to advise.",
                steps =
                    listOf(
                        step("submitted", "Submitted", TicketStepState.DONE),
                        step("ai", "AI review", TicketStepState.CURRENT),
                        step("people", "People", TicketStepState.CURRENT),
                        step("plan", "Fix plan", TicketStepState.LATER),
                        step("solved", "Solved", TicketStepState.LATER),
                    ),
            )
        }

        private fun step(id: String, label: String, state: TicketStepState) =
            TicketStatusStep(id, label, state)
    }
}
