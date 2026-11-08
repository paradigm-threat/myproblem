package app.myproblem.testmode.tickets

/**
 * Pure session driver for live audio intake (no Android deps).
 * Used by unit tests for timely status; ViewModel mirrors the same transitions.
 */
class LiveAudioSession(
    val ticketId: String = "sim",
) {
    var recording: Boolean = false
        private set
    var chunkCount: Int = 0
        private set
    var stage: RealtimeStage = RealtimeStage.LISTENING_PROMPT
        private set
    var coachLine: String = RealtimeIntakeStages.coachLine(stage)
        private set
    var intake: IntakeStatus = RealtimeIntakeStages.intakeStatus(stage)
        private set
    var title: String = "Listening…"
        private set
    var description: String = ""
        private set
    var titleLocked: Boolean = false
    var descriptionLocked: Boolean = false

    val stageHistory = mutableListOf<RealtimeStage>()
    val timeline = mutableListOf<TimelineEntry>()

    fun start() {
        recording = true
        chunkCount = 0
        applyStep(LiveAudioIntakeSim.step(0, recording = true), logMajor = false)
        appendMajor(
            TimelineKind.SYSTEM,
            "Ticket opened (audio)",
        )
    }

    fun onChunk() {
        check(recording) { "not recording" }
        chunkCount += 1
        val step = LiveAudioIntakeSim.step(chunkCount, recording = true)
        applyStep(step, logMajor = false) // chunks do not spam the log
    }

    fun stop(hasFinalAudio: Boolean = true) {
        check(recording) { "not recording" }
        recording = false
        val usable =
            titleLocked ||
                (title.isNotBlank() &&
                    title != "Listening…" &&
                    title.length > 4)
        val step = LiveAudioIntakeSim.afterStop(chunkCount, usable)
        applyStep(step, logMajor = false)
        if (hasFinalAudio) {
            appendMajor(TimelineKind.USER_AUDIO, "Final audio attached")
        }
        // Stay on QUEUED — TRANSCRIBING/FIGURING arrive only from server/Batch sync.
    }

    fun applyIntakeDecision(decision: IntakeDecision) {
        intake = decision.intake
        stage = RealtimeIntakeStages.fromIntake(decision.intake)
        if (decision.intake == IntakeStatus.QUEUE_PROJECT) {
            intake = IntakeStatus.INVESTIGATING
            stage = RealtimeStage.INVESTIGATING
        }
        coachLine =
            when {
                decision.summary.isNotBlank() -> decision.summary
                else -> RealtimeIntakeStages.coachLine(stage)
            }
        if (!titleLocked && decision.title.isNotBlank()) title = decision.title
        if (!descriptionLocked && decision.summary.isNotBlank() && description.isBlank()) {
            description = decision.summary
        }
        recordStage(stage)
        appendMajor(TimelineKind.SERVER_TITLE, decision.summary.ifBlank { "Intake updated" })
        decision.questions.forEach { appendMajor(TimelineKind.SERVER_QUESTION, it) }
        decision.advice?.let { appendMajor(TimelineKind.SERVER_ADVICE, it) }
    }

    fun lockTitleDescription(newTitle: String, newDescription: String) {
        title = newTitle.trim().ifBlank { title }
        description = newDescription.trim()
        titleLocked = true
        descriptionLocked = true
        appendMajor(
            TimelineKind.USER_TEXT,
            "Title/description locked by you",
        )
    }

    fun timelyViolations(): List<String> = RealtimeIntakeStages.validateTimely(stageHistory)

    fun majorTimelineKinds(): List<TimelineKind> = timeline.map { it.kind }

    private fun applyStep(step: LiveAudioIntakeSim.Step, logMajor: Boolean) {
        stage = step.stage
        coachLine = step.coachLine
        intake = step.intake
        if (!titleLocked && step.title != null) title = step.title
        if (!descriptionLocked && step.description != null) description = step.description
        recordStage(step.stage)
        if (logMajor) {
            appendMajor(TimelineKind.SYSTEM, step.coachLine)
        }
    }

    private fun recordStage(s: RealtimeStage) {
        if (stageHistory.lastOrNull() != s) stageHistory += s
    }

    private fun appendMajor(kind: TimelineKind, body: String) {
        if (!TimelinePolicy.isMajor(kind)) return
        timeline +=
            TimelineEntry(
                id = "e${timeline.size}",
                kind = kind,
                body = body,
                atMs = timeline.size.toLong(),
            )
    }
}
