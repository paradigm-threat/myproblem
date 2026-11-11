package app.myproblem.testmode

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import app.myproblem.testmode.prefs.AppPrefs
import app.myproblem.testmode.tickets.CoachLines
import app.myproblem.testmode.tickets.FieldSource
import app.myproblem.testmode.tickets.IntakeHeuristics
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LiveAudioIntakeSim
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.LocalTicketStore
import app.myproblem.testmode.tickets.RealtimeIntakeStages
import app.myproblem.testmode.tickets.RealtimeStage
import app.myproblem.testmode.tickets.StartMode
import app.myproblem.testmode.tickets.TicketField
import app.myproblem.testmode.tickets.TicketStatus
import app.myproblem.testmode.tickets.TicketSyncEngine
import app.myproblem.testmode.tickets.TimelineEntry
import app.myproblem.testmode.tickets.TimelineKind
import app.myproblem.testmode.tickets.TimelinePolicy
import app.myproblem.testmode.tickets.chipLabel
import app.myproblem.testmode.tickets.normalizeStuckIntake
import app.myproblem.testmode.tickets.ServerProblem
import app.myproblem.testmode.tickets.SyncHealth
import app.myproblem.testmode.tickets.explainServerFailure
import app.myproblem.testmode.tickets.TicketsApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

data class AppUiState(
    val onboarded: Boolean = false,
    val startMode: StartMode = StartMode.AUDIO,
    val showArchived: Boolean = false,
    val onlineSyncEnabled: Boolean = true,
    val tickets: List<LocalTicket> = emptyList(),
    val ready: Boolean = false,
)

class AppViewModel(app: Application) : AndroidViewModel(app) {
    private val prefs = AppPrefs(app)
    private val store = LocalTicketStore(app)
    private val ticketsFlow = MutableStateFlow(store.list())
    private val onlineFlag = AtomicBoolean(true)
    private val liveJobs = ConcurrentHashMap<String, Job>()

    private val syncEngine =
        TicketSyncEngine(
            scope = viewModelScope,
            store = store,
            onUpdated = { ticketsFlow.value = store.list().map { it.normalizeStuckIntake() } },
            onlineEnabled = { onlineFlag.get() },
        )

    init {
        reload()
    }

    val uiState: StateFlow<AppUiState> =
        combine(
            prefs.onboarded,
            prefs.startMode,
            prefs.showArchived,
            prefs.onlineSyncEnabled,
            ticketsFlow,
        ) { onboarded, mode, archived, online, tickets ->
            onlineFlag.set(online)
            AppUiState(
                onboarded = onboarded,
                startMode = mode,
                showArchived = archived,
                onlineSyncEnabled = online,
                tickets = tickets,
                ready = true,
            )
        }.stateIn(viewModelScope, SharingStarted.Eagerly, AppUiState())

    fun visibleTickets(): List<LocalTicket> {
        val s = uiState.value
        return if (s.showArchived) {
            s.tickets
        } else {
            s.tickets.filter { it.status == TicketStatus.OPEN }
        }
    }

    fun completeOnboarding(mode: StartMode) {
        viewModelScope.launch { prefs.completeOnboarding(mode) }
    }

    fun setStartMode(mode: StartMode) {
        viewModelScope.launch { prefs.setStartMode(mode) }
    }

    fun setShowArchived(show: Boolean) {
        viewModelScope.launch { prefs.setShowArchived(show) }
    }

    fun setOnlineSyncEnabled(enabled: Boolean) {
        viewModelScope.launch {
            prefs.setOnlineSyncEnabled(enabled)
            onlineFlag.set(enabled)
            // Re-attempt pending tickets when toggled on.
            if (enabled) {
                store.list().forEach { syncEngine.enqueueSync(it.id) }
            }
        }
    }

    fun reload() {
        val list =
            store.list().map { t ->
                val n = t.normalizeStuckIntake()
                if (n.intake != t.intake || n.coachLine != t.coachLine) store.save(n)
                n
            }
        ticketsFlow.value = list
        list
            .filter {
                it.intake == IntakeStatus.QUEUED || it.intake == IntakeStatus.TRANSCRIBING
            }
            .forEach { syncEngine.ensureStatusPoll(it.id) }
    }

    fun ticket(id: String): LocalTicket? = store.load(id)

    fun retrySync(ticketId: String) {
        syncEngine.enqueueSync(ticketId)
    }

    /**
     * Ask server to reprocess ASR/vision. Only succeeds when new context would change the outcome.
     * [requestedBy] = "user" or "apk_llm". If gate needs reupload, re-POSTs local audio with hotwords.
     */
    fun requestReprocess(
        ticketId: String,
        requestedBy: String = "user",
        addedNames: List<String> = emptyList(),
        addedOcr: List<String> = emptyList(),
        newUserNote: String? = null,
    ) {
        viewModelScope.launch {
            val t = store.load(ticketId) ?: return@launch
            val serverId = t.sync.serverTicketId
            val claim = t.sync.serverClaim
            // UUID is the capability; claim is optional defense-in-depth.
            if (serverId == null) {
                store.save(
                    t.copy(
                        sync =
                            t.sync.copy(
                                health = SyncHealth.ERROR,
                                lastError = "Not online yet — sync first",
                                problem = ServerProblem.UNAVAILABLE,
                            ),
                    ),
                )
                reload()
                return@launch
            }
            try {
                val result =
                    withContext(kotlinx.coroutines.Dispatchers.IO) {
                        TicketsApi.requestReprocess(
                            ticketUuid = serverId,
                            claim = claim,
                            requestedBy = requestedBy,
                            addedNames = addedNames,
                            addedOcr = addedOcr,
                            newUserNote = newUserNote,
                            titleChanged = t.titleField.locked,
                        )
                    }
                var next =
                    appendTimeline(
                        t,
                        TimelineKind.SYSTEM,
                        if (result.ok) {
                            "Reprocess ${result.action}: ${result.reason}"
                        } else {
                            "Reprocess skipped: ${result.reason ?: "http ${result.httpStatus}"}"
                        },
                    )
                if (result.ok && result.needsReupload) {
                    val audio =
                        store.mediaDir(ticketId).listFiles()?.filter {
                            it.extension in listOf("m4a", "wav", "mp3", "bin", "aac")
                        }?.maxByOrNull { it.lastModified() }
                    if (audio != null) {
                        withContext(kotlinx.coroutines.Dispatchers.IO) {
                            TicketsApi.postEvidenceFile(
                                ticketUuid = serverId,
                                claim = claim,
                                kind = "audio",
                                file = audio,
                                mime = "audio/mp4",
                                isFinal = true,
                                hotwords = result.hotwords,
                            )
                        }
                        next =
                            appendTimeline(
                                next,
                                TimelineKind.SYSTEM,
                                "Re-uploaded audio for reprocess (${result.hotwords.size} hotwords)",
                            )
                    }
                }
                store.save(next)
                reload()
                syncEngine.enqueueSync(ticketId)
            } catch (e: Exception) {
                val banner = explainServerFailure(e.message)
                store.save(
                    t.copy(
                        sync =
                            t.sync.copy(
                                health = SyncHealth.ERROR,
                                lastError = banner.body,
                                problem = banner.problem,
                            ),
                    ),
                )
                reload()
            }
        }
    }

    fun simulateRemoteAhead(ticketId: String) {
        syncEngine.simulateRemoteAhead(ticketId)
    }

    fun createTextTicket(title: String, description: String): LocalTicket {
        val t =
            store.create(
                startMode = StartMode.TEXT,
                title = title.trim(),
                description = description.trim(),
                intake = IntakeStatus.FIGURING_OUT,
            )
        val withText =
            appendTimeline(
                t,
                TimelineKind.USER_TEXT,
                buildString {
                    append(title.trim())
                    if (description.isNotBlank()) append("\n").append(description.trim())
                },
            )
        return applyIntake(withText)
    }

    fun beginAudioTicket(): LocalTicket {
        val t =
            store.create(startMode = StartMode.AUDIO, intake = IntakeStatus.LISTENING).copy(
                recording = true,
                coachLine = CoachLines.STATE_PROBLEM,
                title = "Listening…",
                titleField = TicketField(value = "Listening…", source = FieldSource.INTAKE, locked = false),
            )
        store.save(t)
        reload()
        notifySync(t.id)
        startLiveChunkLoop(t.id)
        return t
    }

    fun beginAvTicket(): LocalTicket {
        val t =
            store.create(startMode = StartMode.AUDIO_FRAMES, intake = IntakeStatus.LISTENING).copy(
                recording = true,
                coachLine = CoachLines.STATE_PROBLEM,
                title = "Listening…",
                titleField = TicketField(value = "Listening…", source = FieldSource.INTAKE, locked = false),
            )
        store.save(t)
        reload()
        notifySync(t.id)
        startLiveChunkLoop(t.id)
        return t
    }

    fun audioFileFor(ticketId: String): File =
        File(store.mediaDir(ticketId), "voice_${System.currentTimeMillis()}.m4a")

    fun stillFileFor(ticketId: String): File =
        File(store.mediaDir(ticketId), "still_${System.currentTimeMillis()}.jpg")

    /** Simulate uploading an audio chunk while recording (server ASR/intake later). */
    fun onLiveAudioChunk(ticketId: String, chunkFile: File? = null): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        if (!t.recording) return t
        val chunk = t.audioChunkCount + 1
        val step = LiveAudioIntakeSim.step(chunk, recording = true)
        var next =
            t.copy(
                audioChunkCount = chunk,
                hasAudio = true,
                updatedAtMs = System.currentTimeMillis(),
                coachLine = step.coachLine,
                intake = step.intake,
            )
        next = applyProposedFields(next, step.title, step.description)
        // Per-chunk uploads are not timeline events — coach/chip carry realtime status.
        store.save(next)
        reload()
        notifySync(ticketId)
        return store.load(ticketId)
    }

    /** AV path / legacy: flush audio the same as Stop (ticket already exists). */
    fun onAudioCaptured(ticketId: String, file: File): LocalTicket? =
        stopAudioRecording(ticketId, file)

    fun stopAudioRecording(ticketId: String, finalFile: File?): LocalTicket? {
        liveJobs.remove(ticketId)?.cancel()
        val t = store.load(ticketId) ?: return null
        val usableTitle =
            t.titleField.locked ||
                (t.titleField.value.isNotBlank() &&
                    t.titleField.value != "Listening…" &&
                    t.titleField.value.length > 4)
        val after = LiveAudioIntakeSim.afterStop(t.audioChunkCount, hasUsableTitle = usableTitle)
        var next =
            t.copy(
                recording = false,
                hasAudio = t.hasAudio || finalFile != null,
                coachLine = after.coachLine,
                updatedAtMs = System.currentTimeMillis(),
                intake = after.intake,
            )
        if (finalFile != null) {
            next =
                appendTimeline(
                    next,
                    TimelineKind.USER_AUDIO,
                    "Final audio (${finalFile.length() / 1024} KB)",
                    finalFile.absolutePath,
                )
        } else if (t.hasAudio || t.audioChunkCount > 0) {
            next = appendTimeline(next, TimelineKind.USER_AUDIO, "Final audio flush")
        }
        // Stay on QUEUED until server/Batch advances — do not fake “Transcribing” or “Figuring out”.
        store.save(next)
        reload()
        notifySync(ticketId)
        return store.load(ticketId)
    }

    /** User commits title/description — intake must not overwrite. */
    fun lockTitleDescription(ticketId: String, title: String, description: String): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        val titleTrim = title.trim()
        val descTrim = description.trim()
        var next =
            t.copy(
                title = titleTrim.ifBlank { t.title },
                description = descTrim,
                titleField =
                    TicketField(
                        value = titleTrim.ifBlank { t.displayTitle() },
                        source = FieldSource.USER,
                        locked = true,
                    ),
                descriptionField =
                    TicketField(
                        value = descTrim,
                        source = FieldSource.USER,
                        locked = true,
                    ),
                updatedAtMs = System.currentTimeMillis(),
                intake = IntakeStatus.FIGURING_OUT,
            )
        next =
            appendTimeline(
                next,
                TimelineKind.USER_TEXT,
                "Title/description locked by you:\n${next.title}",
            )
        return applyIntake(next)
    }

    private fun startLiveChunkLoop(ticketId: String) {
        liveJobs.remove(ticketId)?.cancel()
        liveJobs[ticketId] =
            viewModelScope.launch {
                var i = 0
                while (isActive) {
                    delay(2_500L)
                    val cur = store.load(ticketId) ?: break
                    if (!cur.recording) break
                    i++
                    // Chunk file placeholder until real segmenter; still advances intake sim.
                    onLiveAudioChunk(ticketId, chunkFile = null)
                }
            }
    }

    private fun applyProposedFields(
        ticket: LocalTicket,
        title: String?,
        description: String?,
    ): LocalTicket {
        var titleField = ticket.titleField
        var descField = ticket.descriptionField
        var titleStr = ticket.title
        var descStr = ticket.description
        if (title != null && !titleField.locked) {
            titleField = TicketField(value = title, source = FieldSource.INTAKE, locked = false)
            titleStr = title
        }
        if (description != null && !descField.locked) {
            descField = TicketField(value = description, source = FieldSource.INTAKE, locked = false)
            descStr = description
        }
        return ticket.copy(
            title = titleStr,
            description = descStr,
            titleField = titleField,
            descriptionField = descField,
        )
    }

    fun onStillCaptured(ticketId: String, file: File): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        var next =
            t.copy(
                stillCount = t.stillCount + 1,
                updatedAtMs = System.currentTimeMillis(),
                intake = IntakeStatus.FIGURING_OUT,
            )
        next =
            appendTimeline(
                next,
                TimelineKind.USER_STILL,
                "Still kept #${next.stillCount}",
                file.absolutePath,
            )
        return applyIntake(next)
    }

    /** A finished clip while the person is still talking. Sync uploads it as rolling. */
    fun onRollingClip(ticketId: String, file: File) {
        val t = store.load(ticketId) ?: return
        val next =
            appendTimeline(
                t.copy(hasAudio = true, updatedAtMs = System.currentTimeMillis()),
                TimelineKind.USER_AUDIO,
                "Rolling audio clip",
                file.absolutePath,
            )
        store.save(next)
        reload()
        notifySync(ticketId)
        viewModelScope.launch {
            delay(4_000)
            refreshAsk(ticketId)
        }
    }

    fun refreshAsk(ticketId: String) {
        val cur = store.load(ticketId) ?: return
        if (cur.sync.serverTicketId.isNullOrBlank()) return
        viewModelScope.launch {
            try {
                val pulled = syncEngine.pullNow(ticketId) ?: return@launch
                store.save(pulled)
                reload()
            } catch (e: kotlinx.coroutines.CancellationException) {
                throw e
            } catch (e: Exception) {
                syncEngine.reportReachFailure(ticketId, e.message)
                reload()
            }
        }
    }

    fun applyManualFill(ticketId: String, title: String, description: String): LocalTicket? =
        lockTitleDescription(ticketId, title, description)

    fun answerQuestion(ticketId: String, question: String, answer: String): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        val next =
            appendTimeline(
                t.copy(updatedAtMs = System.currentTimeMillis()),
                TimelineKind.USER_TEXT,
                "Q: $question\nA: $answer",
            )
        return applyIntake(next)
    }

    fun closeTicket(ticketId: String) {
        liveJobs.remove(ticketId)?.cancel()
        val t = store.load(ticketId) ?: return
        store.save(
            t.copy(
                status = TicketStatus.CLOSED,
                recording = false,
                updatedAtMs = System.currentTimeMillis(),
            ),
        )
        reload()
        notifySync(ticketId)
    }

    fun reopenTicket(ticketId: String) {
        val t = store.load(ticketId) ?: return
        store.save(
            t.copy(
                status = TicketStatus.OPEN,
                updatedAtMs = System.currentTimeMillis(),
            ),
        )
        reload()
        notifySync(ticketId)
    }

    fun runIntakeAgain(ticketId: String): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        return applyIntake(t.copy(intake = IntakeStatus.FIGURING_OUT, updatedAtMs = System.currentTimeMillis()))
    }

    private fun applyIntake(ticket: LocalTicket): LocalTicket {
        val keepServerAsk = ticket.currentAsk.isNotBlank() || ticket.coachLine.startsWith("Safety warning")
        val decision = IntakeHeuristics.decide(ticket)
        val now = System.currentTimeMillis()
        var next =
            ticket.copy(
                questions = if (keepServerAsk) ticket.questions else decision.questions,
                updatedAtMs = now,
                intake = if (keepServerAsk) ticket.intake else decision.intake,
            )
        if (!ticket.titleField.locked) {
            val title = decision.title.ifBlank { ticket.title }
            next =
                next.copy(
                    title = title,
                    titleField = TicketField(value = title, source = FieldSource.INTAKE, locked = false),
                )
        }
        if (!ticket.descriptionField.locked && decision.summary.isNotBlank() && ticket.description.isBlank()) {
            next =
                next.copy(
                    description = decision.summary,
                    descriptionField =
                        TicketField(value = decision.summary, source = FieldSource.INTAKE, locked = false),
                )
        }
        var intake = if (keepServerAsk) ticket.intake else decision.intake
        if (intake == IntakeStatus.QUEUE_PROJECT) {
            intake = IntakeStatus.INVESTIGATING
        }
        val stage = RealtimeIntakeStages.fromIntake(intake)
        if (!keepServerAsk) {
            next =
                next.copy(
                    intake = intake,
                    coachLine =
                        decision.summary.ifBlank { RealtimeIntakeStages.coachLine(stage) },
                )
        }
        next =
            appendTimeline(
                next,
                TimelineKind.SERVER_TITLE,
                if (keepServerAsk) ticket.currentAsk.ifBlank { "Intake updated" }
                else decision.summary.ifBlank { "Intake updated · ${intake.chipLabel()}" },
            )
        if (!keepServerAsk) {
            decision.questions.forEach { q ->
                next = appendTimeline(next, TimelineKind.SERVER_QUESTION, q)
            }
        }
        if (!keepServerAsk && decision.advice != null) {
            next = appendTimeline(next, TimelineKind.SERVER_ADVICE, decision.advice)
        }
        store.save(next)
        reload()
        notifySync(next.id)
        return store.load(next.id) ?: next
    }

    private fun notifySync(ticketId: String) {
        syncEngine.markLocalChangeAndSync(ticketId)
    }

    private fun appendTimeline(
        ticket: LocalTicket,
        kind: TimelineKind,
        body: String,
        localPath: String? = null,
    ): LocalTicket {
        if (!TimelinePolicy.isMajor(kind)) return ticket
        val entry =
            TimelineEntry(
                id = UUID.randomUUID().toString(),
                kind = kind,
                body = body,
                atMs = System.currentTimeMillis(),
                localPath = localPath,
            )
        val next = ticket.copy(timeline = ticket.timeline + entry, updatedAtMs = entry.atMs)
        store.save(next)
        return next
    }
}
