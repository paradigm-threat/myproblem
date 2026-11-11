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

/** Client-facing intake / async chips — must match honest server states. */
enum class IntakeStatus {
    DRAFT,
    LISTENING,
    /** Uploaded; waiting for Batch (not yet transcribing). */
    QUEUED,
    /** Batch is actively running ASR (short-lived). */
    TRANSCRIBING,
    FIGURING_OUT,
    NAMED_AND_QUESTIONS,
    ADVICE_READY,
    QUEUE_PROJECT,
    NEEDS_USER_TEXT,
    INVESTIGATING,
    /** Queued/processing too long without a result. */
    TIMEOUT,
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
    /** Claim token from create — Authorization Bearer for evidence/reprocess. */
    val serverClaim: String? = null,
    val syncStartedAtMs: Long? = null,
    val lastSyncedAtMs: Long? = null,
    val lastError: String? = null,
    /** Slow vs unreachable. Set with [lastError] when health is ERROR. */
    val problem: ServerProblem? = null,
    /** 0f..1f while SYNCING; null when idle. */
    val progress: Float? = null,
)

enum class FieldSource {
    INTAKE,
    USER,
}

/** Proposed (intake) vs committed (user) title/description. */
data class TicketField(
    val value: String = "",
    val source: FieldSource = FieldSource.INTAKE,
    val locked: Boolean = false,
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
    val titleField: TicketField = TicketField(),
    val descriptionField: TicketField = TicketField(),
    val coachLine: String = "",
    val audioChunkCount: Int = 0,
    val recording: Boolean = false,
    /** Content hashes already POSTed as Evidence — avoid re-upload on every sync. */
    val uploadedSha256: List<String> = emptyList(),
    /** Server gauge. Null until intake has scored the problem. */
    val understandingPct: Int? = null,
    val solutionPct: Int? = null,
    val confidencePhase: String = "",
    /** The one question the capture screen shows. Empty until intake has one. */
    val currentAsk: String = "",
) {
    fun displayTitle(): String = titleField.value.ifBlank { title }

    fun displayDescription(): String = descriptionField.value.ifBlank { description }
}

fun SyncState.chipLabel(): String =
    when (health) {
        SyncHealth.SYNCING ->
            when {
                presence == SyncPresence.LOCAL_ONLY -> "Uploading…"
                remoteRevision > localRevision -> "Updating…"
                localRevision > remoteRevision -> "Uploading…"
                else -> "Syncing…"
            }
        SyncHealth.ERROR ->
            when (problem) {
                ServerProblem.SLOW -> "Server slow"
                ServerProblem.UNAVAILABLE -> "Server unavailable"
                null -> "Sync error"
            }
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
        IntakeStatus.QUEUED -> "Queued"
        IntakeStatus.TRANSCRIBING -> "Transcribing"
        IntakeStatus.FIGURING_OUT -> "Figuring out…"
        IntakeStatus.NAMED_AND_QUESTIONS -> "Questions"
        IntakeStatus.ADVICE_READY -> "Advice ready"
        IntakeStatus.QUEUE_PROJECT -> "Project queued"
        IntakeStatus.NEEDS_USER_TEXT -> "Needs details"
        IntakeStatus.INVESTIGATING -> "Processing"
        IntakeStatus.TIMEOUT -> "Timed out"
    }

/** Local timeouts when sync has not advanced the tip. */
const val QUEUED_TIMEOUT_MS: Long = 30L * 60L * 1000L
const val TRANSCRIBING_TIMEOUT_MS: Long = 10L * 60L * 1000L

fun LocalTicket.withHonestLocalTimeout(nowMs: Long = System.currentTimeMillis()): LocalTicket {
    val age = nowMs - updatedAtMs
    return when (intake) {
        IntakeStatus.QUEUED ->
            if (age > QUEUED_TIMEOUT_MS) {
                copy(
                    intake = IntakeStatus.TIMEOUT,
                    coachLine = CoachLines.TIMEOUT,
                    updatedAtMs = nowMs,
                )
            } else {
                this
            }
        IntakeStatus.TRANSCRIBING ->
            if (age > TRANSCRIBING_TIMEOUT_MS) {
                copy(
                    intake = IntakeStatus.TIMEOUT,
                    coachLine = "Transcription stalled — pull to sync or retry later.",
                    updatedAtMs = nowMs,
                )
            } else {
                this
            }
        else -> this
    }
}

/**
 * Legacy / offline honesty: Transcribing without a recent sync pull is almost
 * always a lie (upload used to set it). Demote to Queued; live poll may promote
 * again when Batch has leased. Always apply local timeout.
 */
fun LocalTicket.normalizeStuckIntake(nowMs: Long = System.currentTimeMillis()): LocalTicket {
    val recentSync =
        sync.lastSyncedAtMs != null && nowMs - sync.lastSyncedAtMs!! < 20_000L
    val demoted =
        if (intake == IntakeStatus.TRANSCRIBING && !recentSync) {
            copy(intake = IntakeStatus.QUEUED, coachLine = CoachLines.QUEUED)
        } else {
            this
        }
    return demoted.withHonestLocalTimeout(nowMs)
}
