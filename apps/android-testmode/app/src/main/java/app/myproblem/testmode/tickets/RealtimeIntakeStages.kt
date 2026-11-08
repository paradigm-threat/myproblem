package app.myproblem.testmode.tickets

/**
 * Realtime audio intake UI stages. Coach banner + intake chip must stay in lockstep.
 * Timeline/log is separate — only major ticket mutations (see [TimelinePolicy]).
 */
enum class RealtimeStage {
    /** Ticket open, mic live, no usable partial yet. */
    LISTENING_PROMPT,

    /** First rough title/desc proposed while still recording. */
    LISTENING_PARTIAL,

    /** Stronger draft; soft hint to stop. */
    LISTENING_REFINE,

    /** Stop flushed; waiting for Batch (honest — not yet ASR). */
    QUEUED,

    /** Batch actively running ASR (server-driven). */
    TRANSCRIBING,

    /** Transcript in; light intake naming/questions. */
    FIGURING_OUT,

    /** Not enough signal — need user text. */
    CLARIFY,

    /** Terminal intake outcomes (chip carries detail). */
    NAMED_AND_QUESTIONS,
    ADVICE_READY,
    QUEUE_PROJECT,
    INVESTIGATING,
}

object CoachLines {
    const val STATE_PROBLEM = "Please state your problem."
    const val REFINE = "Got it — keep talking to refine…"
    const val CLARIFY = "Please clarify in more detail, or wait for server analysis."
    const val STOP_HINT = "Say “stop recording” when you’re done."
    const val QUEUED = "Queued for transcription — waiting for Batch…"
    const val TRANSCRIBING = "Transcribing…"
    const val FIGURING = "Figuring out…"
    const val TIMEOUT = "Timed out waiting for Batch — sync or re-upload."
    const val AFTER_STOP = QUEUED
}

object RealtimeIntakeStages {
    fun coachLine(stage: RealtimeStage): String =
        when (stage) {
            RealtimeStage.LISTENING_PROMPT -> CoachLines.STATE_PROBLEM
            RealtimeStage.LISTENING_PARTIAL -> CoachLines.REFINE
            RealtimeStage.LISTENING_REFINE -> "${CoachLines.REFINE} ${CoachLines.STOP_HINT}"
            RealtimeStage.QUEUED -> CoachLines.QUEUED
            RealtimeStage.TRANSCRIBING -> CoachLines.TRANSCRIBING
            RealtimeStage.FIGURING_OUT -> CoachLines.FIGURING
            RealtimeStage.CLARIFY -> CoachLines.CLARIFY
            RealtimeStage.NAMED_AND_QUESTIONS -> CoachLines.FIGURING
            RealtimeStage.ADVICE_READY -> "Advice ready."
            RealtimeStage.QUEUE_PROJECT, RealtimeStage.INVESTIGATING ->
                "Queued for a deeper look when capacity frees."
        }

    fun intakeStatus(stage: RealtimeStage): IntakeStatus =
        when (stage) {
            RealtimeStage.LISTENING_PROMPT,
            RealtimeStage.LISTENING_PARTIAL,
            RealtimeStage.LISTENING_REFINE,
            -> IntakeStatus.LISTENING
            RealtimeStage.QUEUED -> IntakeStatus.QUEUED
            RealtimeStage.TRANSCRIBING -> IntakeStatus.TRANSCRIBING
            RealtimeStage.FIGURING_OUT -> IntakeStatus.FIGURING_OUT
            RealtimeStage.CLARIFY -> IntakeStatus.NEEDS_USER_TEXT
            RealtimeStage.NAMED_AND_QUESTIONS -> IntakeStatus.NAMED_AND_QUESTIONS
            RealtimeStage.ADVICE_READY -> IntakeStatus.ADVICE_READY
            RealtimeStage.QUEUE_PROJECT -> IntakeStatus.QUEUE_PROJECT
            RealtimeStage.INVESTIGATING -> IntakeStatus.INVESTIGATING
        }

    /** While recording: chunk 1 = first partial, chunk 3+ = refine + stop hint. */
    fun whileRecording(chunkIndex: Int): RealtimeStage =
        when {
            chunkIndex <= 0 -> RealtimeStage.LISTENING_PROMPT
            chunkIndex == 1 -> RealtimeStage.LISTENING_PARTIAL
            chunkIndex == 2 -> RealtimeStage.LISTENING_PARTIAL
            else -> RealtimeStage.LISTENING_REFINE
        }

    /**
     * Immediate post-stop stage. Honest default is QUEUED (Batch not started yet).
     * TRANSCRIBING only arrives from the server when Batch leases the job.
     */
    fun immediatelyAfterStop(chunkCount: Int, hasUsableTitle: Boolean): RealtimeStage =
        if (chunkCount < 2 && !hasUsableTitle) RealtimeStage.CLARIFY
        else RealtimeStage.QUEUED

    fun fromIntake(intake: IntakeStatus): RealtimeStage =
        when (intake) {
            IntakeStatus.LISTENING -> RealtimeStage.LISTENING_PROMPT
            IntakeStatus.QUEUED -> RealtimeStage.QUEUED
            IntakeStatus.TRANSCRIBING -> RealtimeStage.TRANSCRIBING
            IntakeStatus.FIGURING_OUT -> RealtimeStage.FIGURING_OUT
            IntakeStatus.NEEDS_USER_TEXT -> RealtimeStage.CLARIFY
            IntakeStatus.NAMED_AND_QUESTIONS -> RealtimeStage.NAMED_AND_QUESTIONS
            IntakeStatus.ADVICE_READY -> RealtimeStage.ADVICE_READY
            IntakeStatus.QUEUE_PROJECT -> RealtimeStage.QUEUE_PROJECT
            IntakeStatus.INVESTIGATING -> RealtimeStage.INVESTIGATING
            IntakeStatus.DRAFT, IntakeStatus.TIMEOUT -> RealtimeStage.LISTENING_PROMPT
        }

    /**
     * Timeliness rules for a recorded stage sequence (major transitions only).
     * Returns human-readable violations (empty = ok).
     */
    fun validateTimely(history: List<RealtimeStage>): List<String> {
        if (history.isEmpty()) return listOf("empty history")
        val issues = mutableListOf<String>()
        if (history.first() != RealtimeStage.LISTENING_PROMPT) {
            issues += "must start with LISTENING_PROMPT, got ${history.first()}"
        }
        val firstQueued = history.indexOf(RealtimeStage.QUEUED)
        val firstTranscribe = history.indexOf(RealtimeStage.TRANSCRIBING)
        val firstFiguring = history.indexOf(RealtimeStage.FIGURING_OUT)
        val firstWait = listOf(firstQueued, firstTranscribe).filter { it >= 0 }.minOrNull() ?: -1
        if (firstFiguring >= 0 && (firstWait < 0 || firstWait > firstFiguring)) {
            issues += "FIGURING_OUT must follow QUEUED or TRANSCRIBING"
        }
        val firstPartial = history.indexOfFirst {
            it == RealtimeStage.LISTENING_PARTIAL || it == RealtimeStage.LISTENING_REFINE
        }
        if (firstPartial >= 0) {
            val promptIdx = history.indexOf(RealtimeStage.LISTENING_PROMPT)
            if (promptIdx < 0 || promptIdx > firstPartial) {
                issues += "LISTENING_PARTIAL/REFINE must follow LISTENING_PROMPT"
            }
        }
        // After stop path: no listening stages after TRANSCRIBING/CLARIFY
        val stopIdx =
            history.indexOfFirst {
                it == RealtimeStage.QUEUED ||
                    it == RealtimeStage.TRANSCRIBING ||
                    it == RealtimeStage.CLARIFY
            }
        if (stopIdx >= 0) {
            val after = history.drop(stopIdx + 1)
            if (after.any {
                    it == RealtimeStage.LISTENING_PROMPT ||
                        it == RealtimeStage.LISTENING_PARTIAL ||
                        it == RealtimeStage.LISTENING_REFINE
                }
            ) {
                issues += "must not return to listening after stop"
            }
        }
        return issues
    }
}

/** Timeline/log: major ticket mutations only — not every chunk or coach refresh. */
object TimelinePolicy {
    fun isMajor(kind: TimelineKind): Boolean =
        when (kind) {
            TimelineKind.SYSTEM,
            TimelineKind.USER_TEXT,
            TimelineKind.USER_AUDIO,
            TimelineKind.USER_STILL,
            TimelineKind.SERVER_TITLE,
            TimelineKind.SERVER_QUESTION,
            TimelineKind.SERVER_ADVICE,
            -> true
            TimelineKind.STATUS -> false // coach/chip carry ephemeral status; don't spam the log
        }
}
