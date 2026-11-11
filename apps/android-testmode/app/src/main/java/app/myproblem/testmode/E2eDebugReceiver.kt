package app.myproblem.testmode

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import app.myproblem.testmode.tickets.CoachLines
import app.myproblem.testmode.tickets.CurrentAsk
import app.myproblem.testmode.tickets.IntakeStatus
import app.myproblem.testmode.tickets.LocalTicket
import app.myproblem.testmode.tickets.LocalTicketStore
import app.myproblem.testmode.tickets.SYNC_ERROR_AFTER_MS
import app.myproblem.testmode.tickets.StartMode
import app.myproblem.testmode.tickets.SyncHealth
import app.myproblem.testmode.tickets.SyncPresence
import app.myproblem.testmode.tickets.TicketSyncEngine
import app.myproblem.testmode.tickets.TicketsApi
import app.myproblem.testmode.tickets.chipLabel
import app.myproblem.testmode.tickets.serverBanner
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
                        "create_text" -> createText(app, store, intent)
                        "upload_audio" -> uploadMedia(app, store, intent, kind = "audio")
                        "upload_still" -> uploadMedia(app, store, intent, kind = "still")
                        "reprocess" -> reprocess(store, intent)
                        "sync" -> sync(store, intent)
                        "status" -> status(store, intent)
                        "capture" -> capture(store, intent)
                        "inject_reach" -> injectReach(store, intent)
                        "mark_slow" -> markSlow(store, intent)
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

    private suspend fun createText(context: Context, store: LocalTicketStore, intent: Intent): JSONObject {
        val title = intent.getStringExtra("title") ?: "E2E phone ticket"
        val fileDesc = intent.getStringExtra("descriptionFile")
        val desc =
            if (!fileDesc.isNullOrBlank()) {
                resolveFile(context, fileDesc).readText()
            } else {
                intent.getStringExtra("description") ?: "Created from ADB E2E"
            }
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
        val code = conn.responseCode
        conn.disconnect()
        if (code !in 200..299) throw IllegalStateException("patch_$code")
        store.save(synced)
        val pulled = engine(store).pullNow(synced.id) ?: synced
        return gaugeResult(pulled, "create_text").put("claim", created.claim)
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

    private suspend fun sync(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        val pulled = engine(store).pullNow(localId) ?: return err("ticket_not_found")
        return gaugeResult(pulled, "sync")
    }

    private fun engine(store: LocalTicketStore) =
        TicketSyncEngine(
            scope = scope,
            store = store,
            onUpdated = {},
            onlineEnabled = { true },
        )

    private fun gaugeResult(t: app.myproblem.testmode.tickets.LocalTicket, cmd: String): JSONObject =
        JSONObject()
            .put("ok", true)
            .put("cmd", cmd)
            .put("localId", t.id)
            .put("serverTicketId", t.sync.serverTicketId)
            .put("intake", t.intake.name)
            .put("coach", t.coachLine)
            .put("understanding", t.understandingPct ?: JSONObject.NULL)
            .put("solution", t.solutionPct ?: JSONObject.NULL)
            .put("phase", t.confidencePhase)
            .put("ask", t.currentAsk)
            .put("questions", JSONArray(t.questions))

    private fun capture(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        val t = store.load(localId) ?: return err("ticket_not_found")
        return captureState(t, "capture")
    }

    /** Apply the same failure the sync engine stores, then return the banner the UI shows. */
    private fun injectReach(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        if (store.load(localId) == null) return err("ticket_not_found")
        val raw = intent.getStringExtra("raw") ?: "timed out"
        engine(store).reportReachFailure(localId, raw)
        val t = store.load(localId) ?: return err("ticket_not_found")
        return captureState(t, "inject_reach")
    }

    /** A sync that has already run past the slow threshold, still in flight. */
    private fun markSlow(store: LocalTicketStore, intent: Intent): JSONObject {
        val localId = intent.getStringExtra("localId") ?: return err("missing localId")
        val t = store.load(localId) ?: return err("ticket_not_found")
        val started = System.currentTimeMillis() - SYNC_ERROR_AFTER_MS - 50L
        store.save(
            t.copy(
                sync =
                    t.sync.copy(
                        health = SyncHealth.SYNCING,
                        syncStartedAtMs = started,
                        lastError = null,
                        problem = null,
                        progress = 0.2f,
                    ),
            ),
        )
        val saved = store.load(localId) ?: return err("ticket_not_found")
        return captureState(saved, "mark_slow")
    }

    private fun captureState(t: LocalTicket, cmd: String): JSONObject {
        val banner = t.sync.serverBanner()
        return JSONObject()
            .put("ok", true)
            .put("cmd", cmd)
            .put("localId", t.id)
            .put("ask", CurrentAsk.forTicket(t))
            .put("answerByTalking", CurrentAsk.ANSWER_BY_TALKING)
            .put("chrome", JSONArray(CurrentAsk.captureChrome(t)))
            .put("questionAbovePreview", CurrentAsk.questionIsAbovePreview())
            .put("bannerTitle", banner?.title ?: JSONObject.NULL)
            .put("bannerBody", banner?.body ?: JSONObject.NULL)
            .put("bannerProblem", banner?.problem?.name ?: JSONObject.NULL)
            .put("bannerWaiting", banner?.waiting == true)
            .put("chip", t.sync.chipLabel())
            .put("syncHealth", t.sync.health.name)
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
