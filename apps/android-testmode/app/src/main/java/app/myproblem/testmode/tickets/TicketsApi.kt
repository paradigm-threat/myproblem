package app.myproblem.testmode.tickets

import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

/**
 * Thin HTTP client for Intake ticket host (regional git SoT).
 * UUID = access. Marketing site stays on myproblem.app (Vercel).
 */
object TicketsApi {
    /** Public Intake (Caddy TLS → Spot commit worker). Override in tests if needed. */
    var baseUrl: String = "https://intake.myproblem.app"

    /** georgia | israel — which Relay tickets repo receives commits. */
    var region: String = "georgia"

    data class CreateResult(
        val ticketUuid: String,
        val claim: String?,
        val region: String,
    )

    data class EvidenceResult(
        val ok: Boolean,
        val evidenceId: String?,
        val tipJson: String?,
        val error: String? = null,
    )

    data class ReprocessResult(
        val ok: Boolean,
        val action: String?,
        val needsReupload: Boolean,
        val hotwords: List<String>,
        val reason: String?,
        val httpStatus: Int,
    )

    fun createTicket(): CreateResult {
        val conn = open("POST", "/api/tickets")
        conn.setRequestProperty("content-type", "application/json")
        conn.doOutput = true
        val payload = """{"source":"apk","region":"$region"}"""
        conn.outputStream.use { it.write(payload.toByteArray()) }
        val body = readBody(conn)
        val code = conn.responseCode
        if (code !in 200..299) error("createTicket HTTP $code: $body")
        val json = JSONObject(body)
        val tipClaim =
            json.optJSONObject("tip")?.optString("claim", "")?.takeIf { it.isNotBlank() }
        return CreateResult(
            ticketUuid = json.getString("ticket_uuid"),
            claim =
                json.optString("claim", "").takeIf { it.isNotBlank() }
                    ?: tipClaim,
            region = json.optString("region", region),
        )
    }

    fun getTicket(ticketUuid: String, claim: String? = null): JSONObject {
        val conn = open("GET", "/api/tickets/$ticketUuid")
        if (!claim.isNullOrBlank()) conn.setRequestProperty("authorization", "Bearer $claim")
        val body = readBody(conn)
        if (conn.responseCode !in 200..299) error("getTicket HTTP ${conn.responseCode}: $body")
        return JSONObject(body)
    }

    fun postEvidenceFile(
        ticketUuid: String,
        claim: String? = null,
        kind: String,
        file: File,
        mime: String,
        isFinal: Boolean = true,
        rolling: Boolean = false,
        hotwords: List<String> = emptyList(),
    ): EvidenceResult {
        // Intake commit worker expects JSON + base64 (no multipart).
        val bytes = file.readBytes()
        val b64 = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
        val payload =
            JSONObject()
                .put("kind", kind)
                .put("isFinal", isFinal)
                .put("rolling", rolling)
                .put("base64", b64)
                .put("filename", file.name)
                .put("mime", mime)
        if (hotwords.isNotEmpty()) {
            payload.put("hotwords", org.json.JSONArray(hotwords))
        }
        val conn = open("POST", "/api/tickets/$ticketUuid/evidence")
        if (!claim.isNullOrBlank()) conn.setRequestProperty("authorization", "Bearer $claim")
        conn.setRequestProperty("content-type", "application/json")
        conn.doOutput = true
        conn.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
        val body = readBody(conn)
        val code = conn.responseCode
        if (code !in 200..299) {
            return EvidenceResult(false, null, null, "HTTP $code: $body")
        }
        val json = JSONObject(body)
        return EvidenceResult(
            ok = json.optBoolean("ok", true),
            evidenceId = json.optString("evidenceId").takeIf { it.isNotBlank() },
            tipJson = body,
        )
    }

    fun requestReprocess(
        ticketUuid: String,
        claim: String? = null,
        requestedBy: String,
        target: String = "asr",
        addedNames: List<String> = emptyList(),
        addedOcr: List<String> = emptyList(),
        newUserNote: String? = null,
        titleChanged: Boolean = false,
    ): ReprocessResult {
        val conn = open("POST", "/api/tickets/$ticketUuid/reprocess")
        if (!claim.isNullOrBlank()) conn.setRequestProperty("authorization", "Bearer $claim")
        conn.setRequestProperty("content-type", "application/json")
        conn.doOutput = true
        val delta = JSONObject()
        if (addedNames.isNotEmpty()) delta.put("addedNames", org.json.JSONArray(addedNames))
        if (addedOcr.isNotEmpty()) delta.put("addedOcr", org.json.JSONArray(addedOcr))
        if (newUserNote != null) delta.put("newUserNote", newUserNote)
        if (titleChanged) delta.put("titleChanged", true)
        val payload =
            JSONObject()
                .put("target", target)
                .put("requestedBy", requestedBy)
                .put("contextDelta", delta)
        OutputStreamWriter(conn.outputStream).use { it.write(payload.toString()) }
        val body = readBody(conn)
        val code = conn.responseCode
        val json = runCatching { JSONObject(body) }.getOrNull()
        val gate = json?.optJSONObject("gate")
        val hotwords = mutableListOf<String>()
        gate?.optJSONArray("hotwords")?.let { arr ->
            for (i in 0 until arr.length()) hotwords.add(arr.getString(i))
        }
        return ReprocessResult(
            ok = code in 200..299 && json?.optBoolean("ok") == true,
            action = json?.optString("action"),
            needsReupload = gate?.optBoolean("needsReupload") == true,
            hotwords = hotwords,
            reason = gate?.optString("reason"),
            httpStatus = code,
        )
    }

    private fun open(method: String, path: String): HttpURLConnection {
        val conn = URL("$baseUrl$path").openConnection() as HttpURLConnection
        conn.requestMethod = method
        conn.connectTimeout = 15_000
        conn.readTimeout = 60_000
        conn.instanceFollowRedirects = true
        return conn
    }

    private fun readBody(conn: HttpURLConnection): String {
        val stream =
            try {
                if (conn.responseCode >= 400) conn.errorStream else conn.inputStream
            } catch (_: Exception) {
                conn.errorStream
            } ?: return ""
        return stream.use {
            val bos = ByteArrayOutputStream()
            it.copyTo(bos)
            bos.toString(Charsets.UTF_8.name())
        }
    }
}
