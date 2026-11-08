package app.myproblem.testmode.tickets

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.UUID

/** Offline ticket + timeline JSON under filesDir/tickets/. */
class LocalTicketStore(context: Context) {
    private val root = File(context.filesDir, "tickets").also { it.mkdirs() }
    private val indexFile = File(root, "index.json")

    fun list(): List<LocalTicket> {
        val ids = readIndex()
        return ids.mapNotNull { load(it) }.sortedByDescending { it.updatedAtMs }
    }

    fun load(id: String): LocalTicket? {
        val f = File(root, "$id.json")
        if (!f.exists()) return null
        return runCatching { ticketFromJson(JSONObject(f.readText())) }.getOrNull()
    }

    fun save(ticket: LocalTicket) {
        File(root, "${ticket.id}.json").writeText(ticketToJson(ticket).toString())
        val ids = readIndex().toMutableList()
        if (ticket.id !in ids) ids.add(0, ticket.id)
        writeIndex(ids)
    }

    fun create(
        startMode: StartMode,
        title: String = "",
        description: String = "",
        intake: IntakeStatus = IntakeStatus.DRAFT,
    ): LocalTicket {
        val now = System.currentTimeMillis()
        val id = UUID.randomUUID().toString()
        val ticket =
            LocalTicket(
                id = id,
                createdAtMs = now,
                updatedAtMs = now,
                status = TicketStatus.OPEN,
                title = title.ifBlank { "New problem" },
                description = description,
                startMode = startMode,
                intake = intake,
                timeline =
                    listOf(
                        TimelineEntry(
                            id = UUID.randomUUID().toString(),
                            kind = TimelineKind.SYSTEM,
                            body = "Ticket created (${startMode.name.lowercase().replace('_', '+')})",
                            atMs = now,
                        ),
                    ),
                sync =
                    SyncState(
                        presence = SyncPresence.LOCAL_ONLY,
                        health = SyncHealth.LOCAL_AHEAD,
                        localRevision = 1,
                        remoteRevision = 0,
                    ),
            )
        save(ticket)
        File(root, id).mkdirs()
        return ticket
    }

    fun mediaDir(ticketId: String): File = File(root, ticketId).also { it.mkdirs() }

    private fun readIndex(): List<String> {
        if (!indexFile.exists()) return emptyList()
        return runCatching {
            val arr = JSONArray(indexFile.readText())
            buildList {
                for (i in 0 until arr.length()) add(arr.getString(i))
            }
        }.getOrDefault(emptyList())
    }

    private fun writeIndex(ids: List<String>) {
        val arr = JSONArray()
        ids.forEach { arr.put(it) }
        indexFile.writeText(arr.toString())
    }

    private fun ticketToJson(t: LocalTicket): JSONObject =
        JSONObject()
            .put("id", t.id)
            .put("createdAtMs", t.createdAtMs)
            .put("updatedAtMs", t.updatedAtMs)
            .put("status", t.status.name)
            .put("title", t.title)
            .put("description", t.description)
            .put("startMode", t.startMode.name)
            .put("intake", t.intake.name)
            .put("stillCount", t.stillCount)
            .put("hasAudio", t.hasAudio)
            .put("syncPresence", t.sync.presence.name)
            .put("syncHealth", t.sync.health.name)
            .put("localRevision", t.sync.localRevision)
            .put("remoteRevision", t.sync.remoteRevision)
            .put("serverTicketId", t.sync.serverTicketId)
            .put("syncStartedAtMs", t.sync.syncStartedAtMs)
            .put("lastSyncedAtMs", t.sync.lastSyncedAtMs)
            .put("lastSyncError", t.sync.lastError)
            .put("syncProgress", t.sync.progress?.toDouble() ?: JSONObject.NULL)
            .put(
                "questions",
                JSONArray().also { a -> t.questions.forEach { a.put(it) } },
            )
            .put(
                "timeline",
                JSONArray().also { a ->
                    t.timeline.forEach { e ->
                        a.put(
                            JSONObject()
                                .put("id", e.id)
                                .put("kind", e.kind.name)
                                .put("body", e.body)
                                .put("atMs", e.atMs)
                                .put("localPath", e.localPath),
                        )
                    }
                },
            )

    private fun ticketFromJson(o: JSONObject): LocalTicket {
        val timelineArr = o.optJSONArray("timeline") ?: JSONArray()
        val timeline =
            buildList {
                for (i in 0 until timelineArr.length()) {
                    val e = timelineArr.getJSONObject(i)
                    add(
                        TimelineEntry(
                            id = e.getString("id"),
                            kind = TimelineKind.valueOf(e.getString("kind")),
                            body = e.getString("body"),
                            atMs = e.getLong("atMs"),
                            localPath =
                                if (e.isNull("localPath")) {
                                    null
                                } else {
                                    e.optString("localPath").takeIf { it.isNotBlank() }
                                },
                        ),
                    )
                }
            }
        val qArr = o.optJSONArray("questions") ?: JSONArray()
        val questions =
            buildList {
                for (i in 0 until qArr.length()) add(qArr.getString(i))
            }
        val progressRaw = o.opt("syncProgress")
        val progress =
            when (progressRaw) {
                null, JSONObject.NULL -> null
                is Number -> progressRaw.toFloat()
                else -> null
            }
        val sync =
            SyncState(
                presence =
                    runCatching {
                        SyncPresence.valueOf(o.optString("syncPresence", SyncPresence.LOCAL_ONLY.name))
                    }.getOrDefault(SyncPresence.LOCAL_ONLY),
                health =
                    runCatching {
                        SyncHealth.valueOf(o.optString("syncHealth", SyncHealth.LOCAL_AHEAD.name))
                    }.getOrDefault(SyncHealth.LOCAL_AHEAD),
                localRevision = o.optLong("localRevision", 1),
                remoteRevision = o.optLong("remoteRevision", 0),
                serverTicketId =
                    o.optString("serverTicketId", "").takeIf { it.isNotBlank() },
                syncStartedAtMs =
                    o.optLong("syncStartedAtMs", 0L).takeIf { it > 0L },
                lastSyncedAtMs =
                    o.optLong("lastSyncedAtMs", 0L).takeIf { it > 0L },
                lastError = o.optString("lastSyncError", "").takeIf { it.isNotBlank() },
                progress = progress,
            )
        return LocalTicket(
            id = o.getString("id"),
            createdAtMs = o.getLong("createdAtMs"),
            updatedAtMs = o.getLong("updatedAtMs"),
            status = TicketStatus.valueOf(o.getString("status")),
            title = o.getString("title"),
            description = o.optString("description", ""),
            startMode = StartMode.valueOf(o.getString("startMode")),
            intake = IntakeStatus.valueOf(o.getString("intake")),
            timeline = timeline,
            stillCount = o.optInt("stillCount", 0),
            hasAudio = o.optBoolean("hasAudio", false),
            questions = questions,
            sync = sync,
        )
    }
}
