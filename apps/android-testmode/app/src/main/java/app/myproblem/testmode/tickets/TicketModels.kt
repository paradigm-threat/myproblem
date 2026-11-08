package app.myproblem.testmode.tickets

enum class StartMode {
    TEXT,
    AUDIO,
    AUDIO_FRAMES,
}

enum class TicketStatus {
    OPEN,
    CLOSED,
}

/** Client-facing intake / async chips (local until server wired). */
enum class IntakeStatus {
    DRAFT,
    LISTENING,
    TRANSCRIBING,
    FIGURING_OUT,
    NAMED_AND_QUESTIONS,
    ADVICE_READY,
    QUEUE_PROJECT,
    NEEDS_USER_TEXT,
    INVESTIGATING,
}

enum class TimelineKind {
    USER_TEXT,
    USER_AUDIO,
    USER_STILL,
    STATUS,
    SERVER_TITLE,
    SERVER_QUESTION,
    SERVER_ADVICE,
    SYSTEM,
}

data class TimelineEntry(
    val id: String,
    val kind: TimelineKind,
    val body: String,
    val atMs: Long,
    /** Optional local file path for audio/still. */
    val localPath: String? = null,
)

/**
 * Whether this ticket has ever successfully registered with the server.
 * LOCAL_ONLY = device draft only; ONLINE = has a server `ticket_uuid` / tip.
 */
enum class SyncPresence {
    LOCAL_ONLY,
    ONLINE,
}

/**
 * Replication health between local and server revisions.
 * Auto-sync on every change should move LOCAL/REMOTE_AHEAD → SYNCING → IN_SYNC quickly,
 * or ERROR if not settled within [SYNC_ERROR_AFTER_MS].
 */
enum class SyncHealth {
    IN_SYNC,
    LOCAL_AHEAD,
    REMOTE_AHEAD,
    SYNCING,
    ERROR,
}

const val SYNC_ERROR_AFTER_MS: Long = 8_000L

data class SyncState(
    val presence: SyncPresence = SyncPresence.LOCAL_ONLY,
    val health: SyncHealth = SyncHealth.LOCAL_AHEAD,
    /** Monotonic local mutation counter. */
    val localRevision: Long = 1,
    /** Last revision acknowledged by / pulled from server. */
    val remoteRevision: Long = 0,
    /** Server ticket id once ONLINE. */
    val serverTicketId: String? = null,
    val syncStartedAtMs: Long? = null,
    val lastSyncedAtMs: Long? = null,
    val lastError: String? = null,
    /** 0f..1f while SYNCING; null when idle. */
    val progress: Float? = null,
)

data class LocalTicket(
    val id: String,
    val createdAtMs: Long,
    val updatedAtMs: Long,
    val status: TicketStatus,
    val title: String,
    val description: String,
    val startMode: StartMode,
    val intake: IntakeStatus,
    val timeline: List<TimelineEntry>,
    val stillCount: Int = 0,
    val hasAudio: Boolean = false,
    val questions: List<String> = emptyList(),
    val sync: SyncState = SyncState(),
)

fun SyncState.chipLabel(): String =
    when (health) {
        SyncHealth.SYNCING ->
            when {
                presence == SyncPresence.LOCAL_ONLY -> "Uploading…"
                remoteRevision > localRevision -> "Updating…"
                localRevision > remoteRevision -> "Uploading…"
                else -> "Syncing…"
            }
        SyncHealth.ERROR -> "Sync error"
        SyncHealth.LOCAL_AHEAD ->
            if (presence == SyncPresence.LOCAL_ONLY) "Local only" else "Local ahead"
        SyncHealth.REMOTE_AHEAD -> "Server ahead"
        SyncHealth.IN_SYNC ->
            if (presence == SyncPresence.LOCAL_ONLY) "Local only" else "Synced"
    }

fun SyncState.isBehind(): Boolean =
    health == SyncHealth.LOCAL_AHEAD ||
        health == SyncHealth.REMOTE_AHEAD ||
        health == SyncHealth.SYNCING ||
        health == SyncHealth.ERROR

fun IntakeStatus.chipLabel(): String =
    when (this) {
        IntakeStatus.DRAFT -> "Draft"
        IntakeStatus.LISTENING -> "Listening"
        IntakeStatus.TRANSCRIBING -> "Transcribing"
        IntakeStatus.FIGURING_OUT -> "Figuring out…"
        IntakeStatus.NAMED_AND_QUESTIONS -> "Questions"
        IntakeStatus.ADVICE_READY -> "Advice ready"
        IntakeStatus.QUEUE_PROJECT -> "Queued"
        IntakeStatus.NEEDS_USER_TEXT -> "Needs details"
        IntakeStatus.INVESTIGATING -> "Investigating"
    }
