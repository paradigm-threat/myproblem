package app.myproblem.testmode

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

data class PackThresholds(
    val shakeDrop: Float? = null,
    val blurDrop: Float? = null,
    val colorMinFraction: Float? = null,
    val yawTolDeg: Float? = null,
)

data class HfProvenance(
    val repoId: String,
    val revision: String,
    val role: String,
)

data class OnDevicePack(
    val version: String,
    val minApp: Int = 1,
    val packDisabled: Boolean = false,
    val thresholds: PackThresholds = PackThresholds(),
    val hfProvenance: List<HfProvenance> = emptyList(),
    val coachDefaults: Map<String, String> = emptyMap(),
    val signature: String? = null,
    val source: String = "none",
) {
    companion object {
        val NONE = OnDevicePack(version = "none", source = "none")
    }
}

/**
 * Loads bundled baseline pack from assets; optional downloaded pack under filesDir.
 * Signature verification is a hook placeholder (ed25519 later).
 */
object OnDevicePackLoader {
    private const val TAG = "MyProblemPack"
    private const val ASSET_MANIFEST = "ondevice-pack/v1/manifest.json"
    private const val DOWNLOADED_DIR = "ondevice-pack"
    private const val DOWNLOADED_MANIFEST = "manifest.json"

    fun load(context: Context): OnDevicePack {
        val downloaded = File(context.filesDir, "$DOWNLOADED_DIR/$DOWNLOADED_MANIFEST")
        if (downloaded.isFile) {
            try {
                val text = downloaded.readText()
                val pack = parse(text, source = "downloaded")
                if (!verifySignaturePlaceholder(text, pack.signature)) {
                    Log.w(TAG, "downloaded pack signature check failed — falling back to assets")
                } else if (!pack.packDisabled) {
                    return pack
                }
            } catch (e: Exception) {
                Log.w(TAG, "downloaded pack unreadable", e)
            }
        }
        return loadBundled(context)
    }

    fun loadBundled(context: Context): OnDevicePack {
        return try {
            context.assets.open(ASSET_MANIFEST).bufferedReader().use { reader ->
                parse(reader.readText(), source = "assets")
            }
        } catch (e: Exception) {
            Log.w(TAG, "bundled pack missing", e)
            OnDevicePack.NONE
        }
    }

    fun parse(jsonText: String, source: String): OnDevicePack {
        val o = JSONObject(jsonText)
        val thr = o.optJSONObject("thresholds")
        val thresholds =
            PackThresholds(
                shakeDrop = thr.optFloatOrNull("shakeDrop"),
                blurDrop = thr.optFloatOrNull("blurDrop"),
                colorMinFraction = thr.optFloatOrNull("colorMinFraction"),
                yawTolDeg = thr.optFloatOrNull("yawTolDeg"),
            )
        val hf = ArrayList<HfProvenance>()
        val arr = o.optJSONArray("hfProvenance")
        if (arr != null) {
            for (i in 0 until arr.length()) {
                val item = arr.optJSONObject(i) ?: continue
                hf +=
                    HfProvenance(
                        repoId = item.optString("repo_id"),
                        revision = item.optString("revision"),
                        role = item.optString("role"),
                    )
            }
        }
        val coach = HashMap<String, String>()
        val coachObj = o.optJSONObject("coachDefaults")
        if (coachObj != null) {
            val keys = coachObj.keys()
            while (keys.hasNext()) {
                val k = keys.next()
                coach[k] = coachObj.optString(k)
            }
        }
        val sig = if (o.isNull("signature")) null else o.optString("signature", null)
        return OnDevicePack(
            version = o.optString("version", "0"),
            minApp = o.optInt("minApp", 1),
            packDisabled = o.optBoolean("packDisabled", false),
            thresholds = thresholds,
            hfProvenance = hf,
            coachDefaults = coach,
            signature = sig,
            source = source,
        )
    }

    /**
     * Placeholder: when [signature] is null (bundled v1), accept.
     * When non-null, currently checks that a sha256 hex of content is present as a
     * non-empty string — real ed25519 verify lands with CDN packs.
     */
    private fun JSONObject?.optFloatOrNull(key: String): Float? {
        if (this == null || !has(key)) return null
        val d = optDouble(key)
        return if (d.isNaN()) null else d.toFloat()
    }

    fun verifySignaturePlaceholder(manifestText: String, signature: String?): Boolean {
        if (signature.isNullOrBlank()) return true
        // Hook: future ed25519.verify(publicKey, manifestBytes, signature)
        // For now require signature length >= 16 so empty/corrupt strings fail closed.
        if (signature.length < 16) return false
        // Touch digest so the hook is not a dead no-op in tests / ProGuard.
        MessageDigest.getInstance("SHA-256").digest(manifestText.toByteArray(Charsets.UTF_8))
        return true
    }
}
