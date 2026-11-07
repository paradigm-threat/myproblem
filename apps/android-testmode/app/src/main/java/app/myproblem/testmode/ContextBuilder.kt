package app.myproblem.testmode

import android.util.Log

/**
 * Builds and logs context packets. Tag used for ADB: MyProblemCtx
 */
object ContextBuilder {
    const val TAG = "MyProblemCtx"

    // Tunable thresholds — client-only gate
    const val SHAKE_DROP = 0.85f
    const val MOVING_DIFF = 0.08f
    const val BLUR_DROP = 0.62f
    const val GLARE_DROP = 0.18f
    const val DARK_MAX = 0.12f
    const val BRIGHT_MIN = 0.92f
    const val UNIQUE_MIN_HAMMING = 8

    fun decide(
        feedOn: Boolean,
        stats: ImageStats?,
        attitude: AttitudeSnapshot,
        uniqueDistance: Int,
        sectorsFilled: Set<Int>,
        scenarioActive: Boolean,
        tickMs: Long,
        worthyCount: Int,
        dropCount: Int,
        cameraFps: Float,
        analysisFps: Float,
        tsMs: Long = System.currentTimeMillis(),
    ): ContextPacket {
        val sectorId = AngleScenario.sectorFromYaw(attitude.yawDeg)
        val sectorName = AngleScenario.nameFor(sectorId)
        val shake = attitude.shakeScore
        val isShaking = shake >= SHAKE_DROP
        val frameDiff = stats?.frameDiffEnergy ?: 0f
        val isMoving = isShaking || frameDiff >= MOVING_DIFF

        var decision = Decision.DROP
        var reason = DropReason.FEED_OFF

        if (!feedOn || stats == null) {
            reason = DropReason.FEED_OFF
        } else if (isShaking) {
            reason = DropReason.MOTION
        } else if (stats.blurScore >= BLUR_DROP) {
            reason = DropReason.BLUR
        } else if (stats.glareScore >= GLARE_DROP) {
            reason = DropReason.GLARE
        } else if (stats.brightness <= DARK_MAX) {
            reason = DropReason.DARK
        } else if (stats.brightness >= BRIGHT_MIN) {
            reason = DropReason.BRIGHT
        } else if (uniqueDistance < UNIQUE_MIN_HAMMING) {
            reason = DropReason.DUPLICATE
        } else if (scenarioActive && sectorId in sectorsFilled) {
            reason = DropReason.WRONG_ANGLE
        } else {
            decision = Decision.WORTHY
            reason = DropReason.NONE
        }

        return ContextPacket(
            tsMs = tsMs,
            feedOn = feedOn,
            decision = decision,
            dropReason = reason,
            tickMs = tickMs,
            brightness = stats?.brightness ?: 0f,
            contrast = stats?.contrast ?: 0f,
            blurScore = stats?.blurScore ?: 0f,
            laplacianVar = stats?.laplacianVar ?: 0f,
            complexity = stats?.complexity ?: 0f,
            glareScore = stats?.glareScore ?: 0f,
            isMoving = isMoving,
            isShaking = isShaking,
            shakeScore = shake,
            frameDiffEnergy = frameDiff,
            pitchDeg = attitude.pitchDeg,
            rollDeg = attitude.rollDeg,
            yawDeg = attitude.yawDeg,
            gyroMag = attitude.gyroMag,
            sectorId = sectorId,
            sectorName = sectorName,
            sectorsFilled = sectorsFilled.sorted(),
            scenario = if (scenarioActive) AngleScenario.NAME else "none",
            pHash = stats?.pHash ?: 0L,
            uniqueDistance = uniqueDistance,
            worthyCount = worthyCount,
            dropCount = dropCount,
            cameraFps = cameraFps,
            analysisFps = analysisFps,
            width = stats?.width ?: 0,
            height = stats?.height ?: 0,
        )
    }

    fun log(packet: ContextPacket) {
        Log.i(TAG, packet.toJson().toString())
    }
}
