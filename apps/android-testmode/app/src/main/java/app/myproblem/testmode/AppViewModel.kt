package app.myproblem.testmode

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import app.myproblem.testmode.prefs.AppPrefs
import app.myproblem.testmode.tickets.IntakeHeuristics
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.LocalTicketStore
import app.myproblem.testmode.tickets.StartMode
import app.myproblem.testmode.tickets.TicketStatus
import app.myproblem.testmode.tickets.TicketSyncEngine
import app.myproblem.testmode.tickets.TimelineEntry
import app.myproblem.testmode.tickets.TimelineKind
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.File
import java.util.UUID
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

    private val syncEngine =
        TicketSyncEngine(
            scope = viewModelScope,
            store = store,
            onUpdated = { ticketsFlow.value = store.list() },
            onlineEnabled = { onlineFlag.get() },
        )

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
        ticketsFlow.value = store.list()
    }

    fun ticket(id: String): LocalTicket? = store.load(id)

    fun retrySync(ticketId: String) {
        syncEngine.enqueueSync(ticketId)
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

    fun beginAudioTicket(): LocalTicket =
        store.create(startMode = StartMode.AUDIO, intake = IntakeStatus.LISTENING).also {
            reload()
            notifySync(it.id)
        }

    fun beginAvTicket(): LocalTicket =
        store.create(startMode = StartMode.AUDIO_FRAMES, intake = IntakeStatus.LISTENING).also {
            reload()
            notifySync(it.id)
        }

    fun audioFileFor(ticketId: String): File =
        File(store.mediaDir(ticketId), "voice_${System.currentTimeMillis()}.m4a")

    fun stillFileFor(ticketId: String): File =
        File(store.mediaDir(ticketId), "still_${System.currentTimeMillis()}.jpg")

    fun onAudioCaptured(ticketId: String, file: File): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        var next =
            t.copy(
                hasAudio = true,
                updatedAtMs = System.currentTimeMillis(),
                intake = IntakeStatus.TRANSCRIBING,
            )
        next =
            appendTimeline(
                next,
                TimelineKind.USER_AUDIO,
                "Voice note (${file.length() / 1024} KB) — transcription queued locally",
                file.absolutePath,
            )
        next =
            appendTimeline(
                next,
                TimelineKind.STATUS,
                "Transcribing… (server ASR not wired — local intake next)",
            )
        next = next.copy(intake = IntakeStatus.FIGURING_OUT)
        return applyIntake(next)
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

    fun applyManualFill(ticketId: String, title: String, description: String): LocalTicket? {
        val t = store.load(ticketId) ?: return null
        var next =
            t.copy(
                title = title.trim().ifBlank { t.title },
                description = description.trim(),
                updatedAtMs = System.currentTimeMillis(),
                intake = IntakeStatus.FIGURING_OUT,
            )
        next =
            appendTimeline(
                next,
                TimelineKind.USER_TEXT,
                "Updated details:\n${next.title}\n${next.description}",
            )
        return applyIntake(next)
    }

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
        val t = store.load(ticketId) ?: return
        store.save(
            t.copy(
                status = TicketStatus.CLOSED,
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
        val decision = IntakeHeuristics.decide(ticket)
        val now = System.currentTimeMillis()
        var next =
            ticket.copy(
                title = decision.title.ifBlank { ticket.title },
                intake = decision.intake,
                questions = decision.questions,
                updatedAtMs = now,
            )
        next =
            appendTimeline(
                next,
                TimelineKind.SERVER_TITLE,
                decision.summary,
            )
        decision.questions.forEach { q ->
            next = appendTimeline(next, TimelineKind.SERVER_QUESTION, q)
        }
        if (decision.advice != null) {
            next = appendTimeline(next, TimelineKind.SERVER_ADVICE, decision.advice)
        }
        if (decision.intake == IntakeStatus.QUEUE_PROJECT) {
            next = next.copy(intake = IntakeStatus.INVESTIGATING)
            next =
                appendTimeline(
                    next,
                    TimelineKind.STATUS,
                    "Investigating further when capacity frees (local stub).",
                )
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
