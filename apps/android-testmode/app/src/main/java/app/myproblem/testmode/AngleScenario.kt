package app.myproblem.testmode

/**
 * Rental-car-style "show all angles" — sectors from device yaw (azimuth).
 * A worthy frame only fills a sector when attitude says we're in that slot.
 */
object AngleScenario {
    const val NAME = "all_angles"
    const val SECTOR_COUNT = 8

    val sectorNames =
        listOf(
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW",
        )

    fun sectorFromYaw(yawDeg: Float): Int {
        var y = yawDeg % 360f
        if (y < 0) y += 360f
        // Map [-180,180] style getOrientation azimuth already ~[-180,180]
        // Normalize to [0,360)
        val az = ((yawDeg % 360f) + 360f) % 360f
        val idx = ((az + 22.5f) / 45f).toInt() % SECTOR_COUNT
        return idx
    }

    fun nameFor(sectorId: Int): String =
        if (sectorId !in sectorNames.indices) "?" else sectorNames[sectorId]
}
