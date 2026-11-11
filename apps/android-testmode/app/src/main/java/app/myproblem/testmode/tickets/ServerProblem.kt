package app.myproblem.testmode.tickets

/** Why the phone cannot show a fresh server question. */
enum class ServerProblem {
    SLOW,
    UNAVAILABLE,
}

data class ServerBanner(
    val problem: ServerProblem,
    val title: String,
    val body: String,
    /** True while a request is still in flight past the slow threshold. */
    val waiting: Boolean,
)

fun classifyServerFailure(raw: String?): ServerProblem {
    val s = raw?.lowercase().orEmpty()
    val slow =
        listOf(
            "timed out",
            "timeout",
            "sockettimeout",
            "http 408",
            "http 504",
            " 504",
        )
    if (slow.any { s.contains(it) }) return ServerProblem.SLOW
    return ServerProblem.UNAVAILABLE
}

fun explainServerFailure(raw: String?): ServerBanner {
    if (raw?.contains("offline", ignoreCase = true) == true) {
        return ServerBanner(
            problem = ServerProblem.UNAVAILABLE,
            title = "Phone is offline",
            body = "Online sync is off. Your ticket stays on this phone until you turn it on.",
            waiting = false,
        )
    }
    if (raw?.contains("sync first", ignoreCase = true) == true) {
        return ServerBanner(
            problem = ServerProblem.UNAVAILABLE,
            title = "Not on the server yet",
            body = "This ticket is only on the phone. Sync it, then try again.",
            waiting = false,
        )
    }
    val problem = classifyServerFailure(raw)
    return bannerCopy(problem, waiting = false)
}

fun SyncState.serverBanner(nowMs: Long = System.currentTimeMillis()): ServerBanner? {
    if (health == SyncHealth.ERROR) {
        if (lastError?.contains("sync first", ignoreCase = true) == true) {
            return explainServerFailure(lastError)
        }
        if (lastError?.contains("Online sync is off", ignoreCase = true) == true) {
            return ServerBanner(
                problem = ServerProblem.UNAVAILABLE,
                title = "Phone is offline",
                body = lastError,
                waiting = false,
            )
        }
        val problem = problem ?: classifyServerFailure(lastError)
        return bannerCopy(problem, waiting = false)
    }
    val started = syncStartedAtMs ?: return null
    if (health == SyncHealth.SYNCING && nowMs - started >= SYNC_ERROR_AFTER_MS) {
        return bannerCopy(ServerProblem.SLOW, waiting = true)
    }
    return null
}

/** Home shows one banner. An unreachable server wins over a slow one. */
fun pickHomeTrouble(tickets: List<LocalTicket>): LocalTicket? =
    tickets.firstOrNull {
        it.sync.health == SyncHealth.ERROR && it.sync.problem == ServerProblem.UNAVAILABLE
    } ?: tickets.firstOrNull { it.sync.health == SyncHealth.ERROR }

private fun bannerCopy(problem: ServerProblem, waiting: Boolean): ServerBanner =
    when (problem) {
        ServerProblem.SLOW ->
            ServerBanner(
                problem = problem,
                title = "Server is slow",
                body =
                    if (waiting) {
                        "Intake is still working. You can keep talking. The question updates when it answers."
                    } else {
                        "Intake didn't answer in time. Your ticket stays on this phone. Retry, or keep going and we'll try again."
                    },
                waiting = waiting,
            )
        ServerProblem.UNAVAILABLE ->
            ServerBanner(
                problem = problem,
                title = "Server isn't available",
                body = "We can't reach Intake. Your recording stays on this phone. Retry when you have a connection.",
                waiting = false,
            )
    }
