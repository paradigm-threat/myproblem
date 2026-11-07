package app.myproblem.testmode

/**
 * Server → app deductive capture request (L1).
 * See docs/capture-guidance.md
 */
data class CaptureRequest(
    val id: String,
    val mode: String = "filter",
    val hints: List<CaptureHint> = emptyList(),
    val logic: HintLogic = HintLogic.ALL,
    val coach: String = "",
) {
    val isActive: Boolean get() = hints.isNotEmpty()

    companion object {
        /** Test Mode inject: require blue-ish pixels in frame. */
        fun requireBlueDemo(): CaptureRequest =
            CaptureRequest(
                id = "cr_demo_blue",
                hints =
                    listOf(
                        CaptureHint.Color(
                            h = 210f,
                            s = 0.45f,
                            v = 0.40f,
                            tolH = 28f,
                            tolS = 0.40f,
                            tolV = 0.50f,
                            minFraction = 0.04f,
                            label = "that blue",
                        ),
                    ),
                logic = HintLogic.ALL,
                coach = "Get more blue in frame (debug hint)",
            )

        /** Test Mode inject: require a named yaw sector. */
        fun requireSectorDemo(sectorName: String): CaptureRequest =
            CaptureRequest(
                id = "cr_demo_sector_$sectorName",
                hints = listOf(CaptureHint.Angle(sector = sectorName, orYawDeg = null, tolDeg = 22f)),
                logic = HintLogic.ALL,
                coach = "Turn to face $sectorName (debug hint)",
            )
    }
}

enum class HintLogic {
    ALL,
    ANY,
}

sealed class CaptureHint {
    data class Color(
        val h: Float,
        val s: Float,
        val v: Float,
        val tolH: Float = 25f,
        val tolS: Float = 0.35f,
        val tolV: Float = 0.45f,
        val minFraction: Float = 0.04f,
        val label: String = "",
    ) : CaptureHint()

    data class Shape(
        val kind: String = "bbox_aspect",
        val aspect: Float = 1f,
        val tol: Float = 0.25f,
    ) : CaptureHint()

    data class Angle(
        val sector: String? = null,
        val orYawDeg: Float? = null,
        val tolDeg: Float = 20f,
    ) : CaptureHint()
}

data class HintScores(
    val colorMatch: Float = 1f,
    val shapeMatch: Float = 1f,
    val poseErrDeg: Float = 0f,
    val passed: Boolean = true,
    val failLabel: String = "",
)
