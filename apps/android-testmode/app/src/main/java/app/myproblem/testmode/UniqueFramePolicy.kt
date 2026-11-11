package app.myproblem.testmode

/**
 * How many unique camera frames a live ticket keeps for rapid photo analysis.
 * The gate already rejected blur, glare, and duplicates before this runs.
 */
object UniqueFramePolicy {
    const val MAX_KEPT = 3
    const val MIN_GAP_MS = 800L

    fun shouldKeep(decision: Decision, kept: Int, nowMs: Long, lastKeptMs: Long): Boolean {
        if (decision != Decision.SEND) return false
        if (kept >= MAX_KEPT) return false
        if (lastKeptMs != 0L && nowMs - lastKeptMs < MIN_GAP_MS) return false
        return true
    }
}
