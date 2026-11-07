package app.myproblem.testmode

data class PerfStats(
    val lastTickMs: Long = 0,
    val p50Ms: Long = 0,
    val p95Ms: Long = 0,
    val cameraFps: Float = 0f,
    val analysisFps: Float = 0f,
)

enum class DebugHintMode {
    OFF,
    REQUIRE_BLUE,
    REQUIRE_SECTOR_NE,
}

data class TestModeUiState(
    val feedOn: Boolean = false,
    val scenarioActive: Boolean = true,
    val lastPacket: ContextPacket? = null,
    val lastJson: String = "",
    val worthyCount: Int = 0,
    val dropCount: Int = 0,
    val dropsByReason: Map<String, Int> = emptyMap(),
    val sectorsFilled: Set<Int> = emptySet(),
    val perf: PerfStats = PerfStats(),
    val permissionNeeded: Boolean = false,
    val error: String? = null,
    val debugHintMode: DebugHintMode = DebugHintMode.OFF,
    val captureRequest: CaptureRequest? = null,
    val packVersion: String = "none",
    val packSource: String = "none",
    /** Newest-first human event log (not every frame). */
    val coachLog: List<CoachLogEntry> = emptyList(),
)
