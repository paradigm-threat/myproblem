package app.myproblem.testmode

import org.json.JSONArray
import org.json.JSONObject

/**
 * On-device context for a single analysis tick.
 * Shake / blur / duplicate decisions live here — the server never sees dropped frames.
 */
data class ContextPacket(
    val tsMs: Long,
    val feedOn: Boolean,
    val decision: Decision,
    val dropReason: DropReason,
    val tickMs: Long,
    val brightness: Float,
    val contrast: Float,
    val blurScore: Float,
    val laplacianVar: Float,
    val complexity: Float,
    val glareScore: Float,
    val isMoving: Boolean,
    val isShaking: Boolean,
    val shakeScore: Float,
    val frameDiffEnergy: Float,
    val pitchDeg: Float,
    val rollDeg: Float,
    val yawDeg: Float,
    val gyroMag: Float,
    val sectorId: Int,
    val sectorName: String,
    val sectorsFilled: List<Int>,
    val scenario: String,
    val pHash: Long,
    val uniqueDistance: Int,
    val worthyCount: Int,
    val dropCount: Int,
    val cameraFps: Float,
    val analysisFps: Float,
    val width: Int,
    val height: Int,
    val packVersion: String = "none",
    val captureRequestId: String? = null,
    val coach: String = "",
    val colorMatch: Float = 1f,
    val shapeMatch: Float = 1f,
    val textMatch: Float = 1f,
    val poseErrDeg: Float = 0f,
    val hintFailLabel: String = "",
    val ocrText: String = "",
    /** True when this frame would upload to the server (SEND). */
    val sendReady: Boolean = false,
) {
    fun toJson(): JSONObject =
        JSONObject()
            .put("tsMs", tsMs)
            .put("feedOn", feedOn)
            .put("decision", decision.name)
            .put("dropReason", dropReason.label)
            .put("sendReady", sendReady)
            .put("tickMs", tickMs)
            .put(
                "image",
                JSONObject()
                    .put("brightness", brightness.toDouble())
                    .put("contrast", contrast.toDouble())
                    .put("blurScore", blurScore.toDouble())
                    .put("laplacianVar", laplacianVar.toDouble())
                    .put("complexity", complexity.toDouble())
                    .put("glareScore", glareScore.toDouble())
                    .put("w", width)
                    .put("h", height),
            )
            .put(
                "motion",
                JSONObject()
                    .put("isMoving", isMoving)
                    .put("isShaking", isShaking)
                    .put("shakeScore", shakeScore.toDouble())
                    .put("frameDiffEnergy", frameDiffEnergy.toDouble())
                    .put("gyroMag", gyroMag.toDouble()),
            )
            .put(
                "attitude",
                JSONObject()
                    .put("pitchDeg", pitchDeg.toDouble())
                    .put("rollDeg", rollDeg.toDouble())
                    .put("yawDeg", yawDeg.toDouble())
                    .put("sectorId", sectorId)
                    .put("sectorName", sectorName),
            )
            .put(
                "scenario",
                JSONObject()
                    .put("name", scenario)
                    .put("sectorsFilled", JSONArray(sectorsFilled)),
            )
            .put(
                "uniqueness",
                JSONObject()
                    .put("pHash", java.lang.Long.toUnsignedString(pHash))
                    .put("uniqueDistance", uniqueDistance),
            )
            .put(
                "hints",
                JSONObject()
                    .put("captureRequestId", captureRequestId)
                    .put("coach", coach)
                    .put("colorMatch", colorMatch.toDouble())
                    .put("shapeMatch", shapeMatch.toDouble())
                    .put("textMatch", textMatch.toDouble())
                    .put("poseErr", poseErrDeg.toDouble())
                    .put("failLabel", hintFailLabel)
                    .put("ocrText", ocrText.take(120)),
            )
            .put(
                "pack",
                JSONObject()
                    .put("version", packVersion),
            )
            .put(
                "counts",
                JSONObject()
                    .put("worthy", worthyCount)
                    .put("drops", dropCount),
            )
            .put(
                "perf",
                JSONObject()
                    .put("cameraFps", cameraFps.toDouble())
                    .put("analysisFps", analysisFps.toDouble()),
            )
}
