package app.myproblem.testmode.tickets

/**
 * Local stand-in for server chunk ASR + light intake while the user is speaking.
 * Status/coach come from [RealtimeIntakeStages]; proposals improve with chunk index.
 */
object LiveAudioIntakeSim {
    data class Step(
        val stage: RealtimeStage,
        val coachLine: String,
        val intake: IntakeStatus,
        val title: String?,
        val description: String?,
    )

    fun step(chunkIndex: Int, recording: Boolean): Step {
        val stage =
            if (!recording) RealtimeStage.QUEUED
            else RealtimeIntakeStages.whileRecording(chunkIndex)
        return Step(
            stage = stage,
            coachLine = RealtimeIntakeStages.coachLine(stage),
            intake = RealtimeIntakeStages.intakeStatus(stage),
            title = proposedTitle(chunkIndex, recording),
            description = proposedDescription(chunkIndex, recording),
        )
    }

    fun afterStop(chunkCount: Int, hasUsableTitle: Boolean): Step {
        val stage = RealtimeIntakeStages.immediatelyAfterStop(chunkCount, hasUsableTitle)
        return Step(
            stage = stage,
            coachLine = RealtimeIntakeStages.coachLine(stage),
            intake = RealtimeIntakeStages.intakeStatus(stage),
            title = null,
            description = null,
        )
    }

    fun figuring(): Step {
        val stage = RealtimeStage.FIGURING_OUT
        return Step(
            stage = stage,
            coachLine = RealtimeIntakeStages.coachLine(stage),
            intake = RealtimeIntakeStages.intakeStatus(stage),
            title = null,
            description = null,
        )
    }

    private fun proposedTitle(chunkIndex: Int, recording: Boolean): String? {
        if (!recording || chunkIndex <= 0) return null
        return when (chunkIndex) {
            1 -> "Spoken problem"
            2 -> "Problem from voice note"
            else -> "Voice ticket in progress"
        }
    }

    private fun proposedDescription(chunkIndex: Int, recording: Boolean): String? {
        if (!recording || chunkIndex <= 0) return null
        return when (chunkIndex) {
            1 -> "Gathering details from your voice…"
            2 -> "You described an issue — keep talking to add what you tried and where."
            else ->
                "Live intake has a draft title. Add constraints or safety notes, or say “stop recording.”"
        }
    }

    /**
     * Drive a full listen→stop→intake stage history for timeliness tests.
     * [chunks] simulated chunk arrivals while recording; then stop + figuring.
     */
    fun simulateStageHistory(chunks: Int, runIntakeTo: IntakeStatus? = IntakeStatus.ADVICE_READY): List<RealtimeStage> {
        val hist = mutableListOf(RealtimeStage.LISTENING_PROMPT)
        for (i in 1..chunks) {
            hist += RealtimeIntakeStages.whileRecording(i)
        }
        val usableTitle = chunks >= 1
        val after = RealtimeIntakeStages.immediatelyAfterStop(chunks, usableTitle)
        hist += after
        if (after == RealtimeStage.QUEUED || after == RealtimeStage.TRANSCRIBING) {
            // Server may insert TRANSCRIBING when Batch leases; then figuring.
            if (after == RealtimeStage.QUEUED) hist += RealtimeStage.TRANSCRIBING
            hist += RealtimeStage.FIGURING_OUT
            when (runIntakeTo) {
                IntakeStatus.NAMED_AND_QUESTIONS -> hist += RealtimeStage.NAMED_AND_QUESTIONS
                IntakeStatus.ADVICE_READY -> hist += RealtimeStage.ADVICE_READY
                IntakeStatus.QUEUE_PROJECT -> {
                    hist += RealtimeStage.QUEUE_PROJECT
                    hist += RealtimeStage.INVESTIGATING
                }
                IntakeStatus.NEEDS_USER_TEXT -> hist += RealtimeStage.CLARIFY
                else -> Unit
            }
        }
        return hist
    }
}
