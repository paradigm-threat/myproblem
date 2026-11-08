package app.myproblem.testmode

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import app.myproblem.testmode.tickets.CoachLines
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LocalTicketStore
import app.myproblem.testmode.tickets.StartMode
import app.myproblem.testmode.tickets.SyncHealth
import app.myproblem.testmode.tickets.SyncPresence
import app.myproblem.testmode.tickets.TicketSyncEngine
import app.myproblem.testmode.tickets.TicketsApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/**
 * Debug ADB hook for phone↔server E2E (UIAutomator stalls on CameraX).
 *
 * adb shell am broadcast -a app.myproblem.testmode.E2E -n app.myproblem.testmode/.E2eDebugReceiver \
 *   --es cmd create_text --es title "Flat tire" --es description "spare in trunk"
 */
class E2eDebugReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION) return
        val pending = goAsync()
        val app = context.applicationContext
        scope.launch {
            try {
                val cmd = intent.getStringExtra("cmd") ?: "status"
                val store = LocalTicketStore(app)
                val result =
                    when (cmd) {
                        "create_text" -> createText(store, intent)
                        "upload_audio" -> uploadMedia(app, store, intent, kind = "audio")
                        "upload_still" -> uploadMedia(app, store, intent, kind = "still")
                        "reprocess" -> reprocess(store, intent)
                        "sync" -> sync(store, intent)
                        "status" -> status(store, intent)
                        else -> JSONObject().put("ok", false).put("error", "unknown_cmd").put("cmd", cmd)
                    }
                Log.i(TAG, "E2E_RESULT $result")
            } catch (e: Exception) {
                Log.e(TAG, "E2E_ERROR ${e.message}", e)
                Log.i(TAG, "E2E_RESULT ${JSONObject().put("ok", false).put("error", e.message)}")
            } finally {
                pending.finish()
            }
        }
    }

    private fun createText(store: LocalTicketStore, intent: Intent): JSONObject {
        val title = intent.getStringExtra("title") ?: "E2E phone ticket"
        val desc = intent.getStringExtra("description") ?: "Created from ADB E2E"
        val t =
            store.create(
                startMode = StartMode.TEXT,
                title = title,
                description = desc,
                intake = IntakeStatus.FIGURING_OUT,
            )
        val created = TicketsApi.createTicket()
        val synced =
            t.copy(
                sync =
                    t.sync.copy(
                        presence = SyncPresence.ONLINE,
                        health = SyncHealth.IN_SYNC,
                        serverTicketId = created.ticketUuid,
                        serverClaim = created.claim,
                        remoteRevision = t.sync.localRevision,
                        lastSyncedAtMs = System.currentTimeMillis(),
                    ),
            )
        try {
            val conn =
                URL("${TicketsApi.baseUrl}/api/tickets/${created.ticketUuid}")
                    .openConnection() as HttpURLConnection
            conn.requestMethod = "PATCH"
            if (!created.claim.isNullOrBlank()) {
                conn.setRequestProperty("authorization", "Bearer ${created.claim}")
            }
            conn.setRequestProperty("content-type", "application/json")
            conn.doOutput = true
            conn.outputStream.use {
                it.write(
                    JSONObject()
                        .put("title", title)
                        .put("description", desc)
                        .put("userLocked", true)
                        .toString()
                        .toByteArray(),
                )
            }
            conn.responseCode
            conn.disconnect()
        } catch (_: Exception) {
        }
        store.save(synced)
        return JSONObject()
            .put("ok", true)
            .put("cmd", "create_text")
            .put("localId", synced.id)
            .put("serverTicketId", created.ticketUuid)
            .put("claim", created.claim)
    }

    private fun resolveFile(context: Context, path: String): File {
        val direct = File(path)
        if (direct.isAbsolute && direct.exists()) return direct
        val underFiles = File(context.filesDir, path)
        if (underFiles.exists()) return underFiles
        return direct
    }

    private fun uploadMedia(
        context: Context,
        store: LocalTicketStore,
        intent: Intent,
        kind: String,
    ): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        val path = intent.getStringExtra("path") ?: return err("missing path")
        val t = store.load(localId) ?: return err("ticket_not_found")
        val serverId = t.sync.serverTicketId ?: return err("not_online")
        val claim = t.sync.serverClaim
        val file = resolveFile(context, path)
        if (!file.exists()) return err("file_missing:$path")

        val ext = if (kind == "still") "jpg" else "wav"
        val mime = if (kind == "still") "image/jpeg" else "audio/wav"
        val dest = File(store.mediaDir(localId), "e2e_${System.currentTimeMillis()}.$ext")
        file.copyTo(dest, overwrite = true)
        val hash = TicketSyncEngine.sha256Hex(dest)
        val res =
            TicketsApi.postEvidenceFile(
                ticketUuid = serverId,
                claim = claim,
                kind = kind,
                file = dest,
                mime = mime,
                isFinal = true,
            )
        val next =
            if (kind == "audio") {
                t.copy(
                    hasAudio = true,
                    uploadedSha256 = (t.uploadedSha256 + hash).distinct(),
                    intake = IntakeStatus.QUEUED,
                    coachLine = CoachLines.QUEUED,
                )
            } else {
                t.copy(
                    stillCount = t.stillCount + 1,
                    uploadedSha256 = (t.uploadedSha256 + hash).distinct(),
                )
            }
        store.save(next)
        return JSONObject()
            .put("ok", res.ok)
            .put("cmd", if (kind == "audio") "upload_audio" else "upload_still")
            .put("evidenceId", res.evidenceId)
            .put("error", res.error)
            .put("sha256", hash)
            .put("bytes", dest.length())
            .put("serverTicketId", serverId)
    }

    private fun reprocess(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        val t = store.load(localId) ?: return err("ticket_not_found")
        val serverId = t.sync.serverTicketId ?: return err("not_online")
        val claim = t.sync.serverClaim
        val names =
            (intent.getStringExtra("names") ?: "")
                .split(',')
                .map { it.trim() }
                .filter { it.isNotEmpty() }
        val r =
            TicketsApi.requestReprocess(
                ticketUuid = serverId,
                claim = claim,
                requestedBy = intent.getStringExtra("requestedBy") ?: "user",
                addedNames = names,
                newUserNote = intent.getStringExtra("note"),
            )
        return JSONObject()
            .put("ok", r.ok)
            .put("cmd", "reprocess")
            .put("action", r.action)
            .put("needsReupload", r.needsReupload)
            .put("reason", r.reason)
            .put("httpStatus", r.httpStatus)
            .put("hotwords", JSONArray(r.hotwords))
    }

    private fun sync(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        val t = store.load(localId) ?: return err("ticket_not_found")
        val serverId = t.sync.serverTicketId ?: return err("not_online")
        val claim = t.sync.serverClaim
        val tip = TicketsApi.getTicket(serverId, claim)
        return JSONObject()
            .put("ok", true)
            .put("cmd", "sync")
            .put("serverTicketId", serverId)
            .put("intake", tip.optString("intake"))
            .put("title", tip.optJSONObject("fields")?.optJSONObject("title")?.optString("value"))
            .put("evidenceCount", tip.optJSONArray("evidence")?.length() ?: 0)
    }

    private fun status(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId")
        if (localId != null) {
            val t = store.load(localId) ?: return err("ticket_not_found")
            return JSONObject()
                .put("ok", true)
                .put("localId", t.id)
                .put("title", t.displayTitle())
                .put("serverTicketId", t.sync.serverTicketId)
                .put("claim", t.sync.serverClaim)
                .put("syncHealth", t.sync.health.name)
                .put("uploaded", t.uploadedSha256.size)
        }
        return JSONObject().put("ok", true).put("tickets", JSONArray(store.list().map { it.id }))
    }

    private fun err(msg: String) = JSONObject().put("ok", false).put("error", msg)

    companion object {
        const val ACTION = "app.myproblem.testmode.E2E"
        const val TAG = "MyProblemE2E"
        private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    }
}
