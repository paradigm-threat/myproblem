package app.myproblem.testmode.tickets

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap

/**
 * Auto-sync on mutation. Creates a server ticket, uploads local audio/stills as Evidence
 * (server caches ephemerally), then pulls tip text back. Master media stays on device.
 */
class TicketSyncEngine(
    private val scope: CoroutineScope,
    private val store: LocalTicketStore,
    private val onUpdated: () -> Unit,
    private val onlineEnabled: () -> Boolean,
    private val syncLatencyMs: Long = 200L,
    private val errorAfterMs: Long = SYNC_ERROR_AFTER_MS,
) {
    private val jobs = ConcurrentHashMap<String, Job>()
    private val statusPolls = ConcurrentHashMap<String, Job>()

    fun markLocalChangeAndSync(ticketId: String) {
        val t = store.load(ticketId) ?: return
        val now = System.currentTimeMillis()
        val bumped =
            t.copy(
                sync =
                    t.sync.copy(
                        localRevision = t.sync.localRevision + 1,
                        health = SyncHealth.LOCAL_AHEAD,
                        lastError = null,
                        progress = null,
                        syncStartedAtMs = null,
                    ),
                updatedAtMs = now,
            )
        store.save(bumped)
        onUpdated()
        enqueueSync(ticketId)
    }

    fun enqueueSync(ticketId: String) {
        jobs[ticketId]?.cancel()
        jobs[ticketId] =
            scope.launch {
                delay(120)
                runSync(ticketId)
            }
    }

    fun simulateRemoteAhead(ticketId: String) {
        val t = store.load(ticketId) ?: return
        if (t.sync.presence != SyncPresence.ONLINE) return
        val next =
            t.copy(
                sync =
                    t.sync.copy(
                        remoteRevision = t.sync.localRevision + 1,
                        health = SyncHealth.REMOTE_AHEAD,
                        lastError = null,
                        progress = null,
                        syncStartedAtMs = null,
                    ),
                updatedAtMs = System.currentTimeMillis(),
            )
        store.save(next)
        onUpdated()
        enqueueSync(ticketId)
    }

    private suspend fun runSync(ticketId: String) {
        var t = store.load(ticketId) ?: return
        if (t.sync.health == SyncHealth.IN_SYNC &&
            t.sync.localRevision == t.sync.remoteRevision &&
            t.sync.presence == SyncPresence.ONLINE
        ) {
            return
        }

        val started = System.currentTimeMillis()
        t =
            t.copy(
                sync =
                    t.sync.copy(
                        health = SyncHealth.SYNCING,
                        syncStartedAtMs = started,
                        progress = 0.05f,
                        lastError = null,
                    ),
            )
        store.save(t)
        onUpdated()

        if (!onlineEnabled()) {
            fail(ticketId, "Offline — ticket stays on this device until online sync is available")
            return
        }

        try {
            withContext(Dispatchers.IO) {
                var cur = store.load(ticketId) ?: return@withContext
                var claim = cur.sync.serverClaim
                var serverId = cur.sync.serverTicketId
                val uploaded = cur.uploadedSha256.toMutableSet()

                if (serverId == null) {
                    val created = TicketsApi.createTicket()
                    serverId = created.ticketUuid
                    claim = created.claim
                    cur =
                        cur.copy(
                            sync =
                                cur.sync.copy(
                                    serverTicketId = serverId,
                                    serverClaim = claim,
                                    presence = SyncPresence.ONLINE,
                                    progress = 0.35f,
                                ),
                        )
                    store.save(cur)
                    onUpdated()
                }

                suspend fun maybeUpload(kind: String, file: File, mime: String) {
                    val hash = sha256Hex(file)
                    if (hash in uploaded) return
                    val res =
                        TicketsApi.postEvidenceFile(
                            ticketUuid = serverId!!,
                            claim = claim,
                            kind = kind,
                            file = file,
                            mime = mime,
                            isFinal = true,
                        )
                    if (res.ok) uploaded.add(hash)
                }

                for (entry in cur.timeline) {
                    val path = entry.localPath ?: continue
                    val file = File(path)
                    if (!file.exists()) continue
                    when (entry.kind) {
                        TimelineKind.USER_AUDIO -> maybeUpload("audio", file, "audio/mp4")
                        TimelineKind.USER_STILL -> maybeUpload("still", file, "image/jpeg")
                        else -> Unit
                    }
                }

                if (cur.hasAudio) {
                    store.mediaDir(ticketId).listFiles()
                        ?.filter { it.extension in listOf("m4a", "wav", "mp3", "bin", "aac") }
                        ?.maxByOrNull { it.lastModified() }
                        ?.let { maybeUpload("audio", it, "audio/mp4") }
                }

                val tip = TicketsApi.getTicket(serverId!!, claim)
                cur = store.load(ticketId) ?: return@withContext
                val next =
                    applyTipFields(
                        cur = cur,
                        tip = tip,
                        uploaded = uploaded.toList(),
                        serverId = serverId!!,
                        claim = claim,
                        nowMs = System.currentTimeMillis(),
                    )
                store.save(next)
                onUpdated()
                ensureStatusPoll(ticketId)
            }
        } catch (e: Exception) {
            val elapsed = System.currentTimeMillis() - started
            fail(
                ticketId,
                if (elapsed > errorAfterMs) {
                    "Sync timed out — check connection and retry"
                } else {
                    e.message ?: "Sync failed"
                },
            )
        }
    }

    /** Start/stop Batch status polls from the UI after reload. */
    fun ensureStatusPoll(ticketId: String) {
        val intake = store.load(ticketId)?.intake ?: return
        maybePollStatus(ticketId, intake)
    }

    /**
     * While queued/transcribing, pull tip so Batch lease→done reaches the phone
     * (sync substitute for push until FCM is wired).
     */
    private fun maybePollStatus(ticketId: String, intake: IntakeStatus) {
        if (intake != IntakeStatus.QUEUED && intake != IntakeStatus.TRANSCRIBING) {
            statusPolls.remove(ticketId)?.cancel()
            return
        }
        if (statusPolls[ticketId]?.isActive == true) return
        statusPolls[ticketId] =
            scope.launch {
                val deadline = System.currentTimeMillis() + QUEUED_TIMEOUT_MS
                var intervalMs = 2_500L
                while (System.currentTimeMillis() < deadline) {
                    delay(intervalMs)
                    intervalMs = (intervalMs * 3 / 2).coerceAtMost(15_000L)
                    if (!onlineEnabled()) continue
                    val cur = store.load(ticketId) ?: break
                    if (cur.intake != IntakeStatus.QUEUED && cur.intake != IntakeStatus.TRANSCRIBING) {
                        break
                    }
                    val serverId = cur.sync.serverTicketId ?: break
                    val claim = cur.sync.serverClaim
                    try {
                        val tip =
                            withContext(Dispatchers.IO) {
                                TicketsApi.getTicket(serverId, claim)
                            }
                        val next =
                            applyTipFields(
                                cur = cur,
                                tip = tip,
                                uploaded = cur.uploadedSha256,
                                serverId = serverId,
                                claim = claim,
                                nowMs = System.currentTimeMillis(),
                            )
                        store.save(next)
                        onUpdated()
                        if (next.intake != IntakeStatus.QUEUED &&
                            next.intake != IntakeStatus.TRANSCRIBING
                        ) {
                            break
                        }
                    } catch (_: Exception) {
                        // Keep polling; next tick retries.
                    }
                }
                // Final local honesty if Batch never advanced.
                val last = store.load(ticketId) ?: return@launch
                if (last.intake == IntakeStatus.QUEUED || last.intake == IntakeStatus.TRANSCRIBING) {
                    val timed = last.withHonestLocalTimeout()
                    if (timed.intake == IntakeStatus.TIMEOUT) {
                        store.save(timed)
                        onUpdated()
                    }
                }
            }
    }

    private fun applyTipFields(
        cur: LocalTicket,
        tip: org.json.JSONObject,
        uploaded: List<String>,
        serverId: String,
        claim: String?,
        nowMs: Long,
    ): LocalTicket {
        val coachRaw = tip.optString("coachLine").takeIf { it.isNotBlank() }
        val intake = honestIntakeFromTip(tip, cur.intake)
        val coach =
            when (intake) {
                IntakeStatus.QUEUED ->
                    coachRaw?.takeUnless { it.contains("Transcrib", ignoreCase = true) }
                        ?: CoachLines.QUEUED
                IntakeStatus.TRANSCRIBING -> CoachLines.TRANSCRIBING
                IntakeStatus.TIMEOUT -> CoachLines.TIMEOUT
                else -> coachRaw
            }
        val targetRev = maxOf(cur.sync.localRevision, cur.sync.remoteRevision)
        // Preserve wait-clock while stuck in the same waiting state so timeout can fire.
        val waitStamp =
            if (intake == cur.intake &&
                (intake == IntakeStatus.QUEUED || intake == IntakeStatus.TRANSCRIBING)
            ) {
                cur.updatedAtMs
            } else {
                nowMs
            }
        val fields = tip.optJSONObject("fields")
        val title =
            fields?.optJSONObject("title")?.optString("value")?.takeIf { it.isNotBlank() }
        val desc =
            fields
                ?.optJSONObject("description")
                ?.optString("value")
                ?.takeIf { it.isNotBlank() }
        var next =
            cur.copy(
                uploadedSha256 = uploaded,
                intake = intake,
                coachLine = coach ?: cur.coachLine,
                sync =
                    SyncState(
                        presence = SyncPresence.ONLINE,
                        health = SyncHealth.IN_SYNC,
                        localRevision = targetRev,
                        remoteRevision = targetRev,
                        serverTicketId = serverId,
                        serverClaim = claim,
                        syncStartedAtMs = null,
                        lastSyncedAtMs = nowMs,
                        lastError = null,
                        progress = null,
                    ),
                updatedAtMs = waitStamp,
            )
        if (title != null && !next.titleField.locked) {
            next =
                next.copy(
                    title = title,
                    titleField =
                        TicketField(value = title, source = FieldSource.INTAKE, locked = false),
                )
        }
        if (desc != null && !next.descriptionField.locked) {
            next =
                next.copy(
                    description = desc,
                    descriptionField =
                        TicketField(value = desc, source = FieldSource.INTAKE, locked = false),
                )
        }
        return next.withHonestLocalTimeout(nowMs)
    }

    private fun mapIntake(raw: String): IntakeStatus? =
        when (raw.lowercase()) {
            "draft" -> IntakeStatus.DRAFT
            "listening" -> IntakeStatus.LISTENING
            "queued" -> IntakeStatus.QUEUED
            "transcribing" -> IntakeStatus.TRANSCRIBING
            "figuring_out" -> IntakeStatus.FIGURING_OUT
            "named_and_questions" -> IntakeStatus.NAMED_AND_QUESTIONS
            "advice_ready" -> IntakeStatus.ADVICE_READY
            "queue_project" -> IntakeStatus.QUEUE_PROJECT
            "needs_user_text" -> IntakeStatus.NEEDS_USER_TEXT
            "investigating" -> IntakeStatus.INVESTIGATING
            "timeout" -> IntakeStatus.TIMEOUT
            else -> null
        }

    /**
     * Prefer server intake, but never keep “Transcribing” when jobs are only queued
     * or a transcript already exists.
     */
    fun honestIntakeFromTip(tip: org.json.JSONObject, fallback: IntakeStatus): IntakeStatus {
        val mapped = mapIntake(tip.optString("intake")) ?: fallback
        val evidence = tip.optJSONArray("evidence")
        var hasTranscript = false
        var audioPending = false
        if (evidence != null) {
            for (i in 0 until evidence.length()) {
                val e = evidence.getJSONObject(i)
                when (e.optString("kind")) {
                    "transcript" -> if (e.optString("text").isNotBlank()) hasTranscript = true
                    "audio" -> {
                        if (!e.optBoolean("processed", false) && e.optString("uri").isNotBlank()) {
                            audioPending = true
                        }
                    }
                }
            }
        }
        var asrQueued = false
        var asrLeased = false
        val jobs = tip.optJSONArray("jobs")
        if (jobs != null) {
            for (i in 0 until jobs.length()) {
                val j = jobs.getJSONObject(i)
                if (j.optString("bin") != "asr") continue
                when (j.optString("state")) {
                    "queued" -> asrQueued = true
                    "leased" -> asrLeased = true
                }
            }
        }
        if (hasTranscript) {
            return when (mapped) {
                IntakeStatus.QUEUED, IntakeStatus.TRANSCRIBING, IntakeStatus.LISTENING ->
                    IntakeStatus.NAMED_AND_QUESTIONS
                else -> mapped
            }
        }
        if (asrLeased) return IntakeStatus.TRANSCRIBING
        if (asrQueued || audioPending || mapped == IntakeStatus.TRANSCRIBING) {
            return IntakeStatus.QUEUED
        }
        return mapped
    }

    private fun fail(ticketId: String, message: String) {
        val cur = store.load(ticketId) ?: return
        store.save(
            cur.copy(
                sync =
                    cur.sync.copy(
                        health = SyncHealth.ERROR,
                        progress = null,
                        lastError = message,
                        syncStartedAtMs = cur.sync.syncStartedAtMs,
                    ),
            ),
        )
        onUpdated()
    }

    companion object {
        fun sha256Hex(file: File): String {
            val md = MessageDigest.getInstance("SHA-256")
            file.inputStream().use { input ->
                val buf = ByteArray(8192)
                while (true) {
                    val n = input.read(buf)
                    if (n <= 0) break
                    md.update(buf, 0, n)
                }
            }
            return md.digest().joinToString("") { "%02x".format(it) }
        }
    }
}
