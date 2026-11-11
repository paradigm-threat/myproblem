package app.myproblem.testmode.tickets

/** Labels for the intake confidence gauge. The numbers come from the server. */
object ConfidenceCopy {
    fun understanding(pct: Int): String = "Understanding $pct%"

    fun solution(pct: Int?, phase: String): String =
        when {
            pct == null || phase == "understand" -> "Solution — still learning the problem"
            phase == "human" -> "Solution $pct% — a person should continue"
            phase == "batch" -> "Solution $pct% — not confident enough to advise further"
            else -> "Solution $pct% — next step is specific enough"
        }
}
