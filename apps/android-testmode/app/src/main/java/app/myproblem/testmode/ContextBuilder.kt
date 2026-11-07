package app.myproblem.testmode

import android.util.Log

/**
 * Builds and logs context packets. Tag used for ADB: MyProblemCtx
 *
 * Runs on-device **capabilities** the server asked for (quality, uniqueness,
 * color/angle). Text/OCR is a separate capability applied when needed
 * ([OcrLayer] / [ContextBuilder.afterOcr]) — not a fixed pipeline stage.
 */
object ContextBuilder {
    const val TAG = "MyProblemCtx"

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
        captureRequest: CaptureRequest? = null,
        pack: OnDevicePack = OnDevicePack.NONE,
        ocrText: String = "",
    ): ContextPacket {
        val sectorId = AngleScenario.sectorFromYaw(attitude.yawDeg)
        val sectorName = AngleScenario.nameFor(sectorId)
        val shake = attitude.shakeScore
        val isShaking = shake >= (pack.thresholds.shakeDrop ?: SHAKE_DROP)
        val frameDiff = stats?.frameDiffEnergy ?: 0f
        val isMoving = isShaking || frameDiff >= MOVING_DIFF

        val blurDrop = pack.thresholds.blurDrop ?: BLUR_DROP
        val colorMin = pack.thresholds.colorMinFraction ?: 0.04f
        val needsOcr = OcrLayer.hasTextHints(captureRequest)

        // Color/angle/shape now; text capability runs via OcrLayer when KEEP
        val hintScores =
            HintScorers.score(
                request = captureRequest,
                hsvSamples = stats?.hsvSamples,
                sampleCount = stats?.hsvSampleCount ?: 0,
                yawDeg = attitude.yawDeg,
                sectorName = sectorName,
                blobAspect = stats?.blobAspect,
                ocrText = "",
                colorMinFractionDefault = colorMin,
                includeTextHints = false,
            )

        var decision = Decision.DROP
        var reason = DropReason.FEED_OFF

        if (!feedOn || stats == null) {
            reason = DropReason.FEED_OFF
        } else if (isShaking) {
            reason = DropReason.MOTION
        } else if (stats.blurScore >= blurDrop) {
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
        } else if (captureRequest != null && captureRequest.isActive && !hintScores.passed) {
            reason = DropReason.WRONG_TARGET
        } else if (needsOcr) {
            decision = Decision.KEEP
            reason = DropReason.OCR_PENDING
        } else {
            decision = Decision.SEND
            reason = DropReason.NONE
        }

        return packet(
            tsMs = tsMs,
            feedOn = feedOn,
            decision = decision,
            reason = reason,
            tickMs = tickMs,
            stats = stats,
            isMoving = isMoving,
            isShaking = isShaking,
            shake = shake,
            frameDiff = frameDiff,
            attitude = attitude,
            sectorId = sectorId,
            sectorName = sectorName,
            sectorsFilled = sectorsFilled,
            scenarioActive = scenarioActive,
            uniqueDistance = uniqueDistance,
            worthyCount = worthyCount,
            dropCount = dropCount,
            cameraFps = cameraFps,
            analysisFps = analysisFps,
            pack = pack,
            captureRequest = captureRequest,
            hintScores = hintScores,
            ocrText = ocrText,
            sendReady = decision == Decision.SEND,
        )
    }

    /** Apply OCR capability result to a kept candidate frame. */
    fun afterOcr(
        kept: ContextPacket,
        verdict: OcrVerdict,
        captureRequest: CaptureRequest?,
    ): ContextPacket {
        val (decision, reason) =
            when (verdict.outcome) {
                OcrOutcome.NO_HINT, OcrOutcome.MATCH -> Decision.SEND to DropReason.NONE
                OcrOutcome.EMPTY -> Decision.DROP to DropReason.WRONG_TEXT
                OcrOutcome.REJECT -> Decision.DROP to DropReason.WRONG_TEXT
                OcrOutcome.SAME_REJECTED -> Decision.DROP to DropReason.SAME_TEXT
            }
        return kept.copy(
            decision = decision,
            dropReason = reason,
            textMatch = verdict.textMatch,
            ocrText = verdict.display.ifBlank { kept.ocrText }.take(200),
            sendReady = decision == Decision.SEND,
            coach = verdict.message.ifBlank { captureRequest?.coach.orEmpty() },
            hintFailLabel =
                when (verdict.outcome) {
                    OcrOutcome.MATCH, OcrOutcome.NO_HINT -> ""
                    else -> "text"
                },
        )
    }

    private fun packet(
        tsMs: Long,
        feedOn: Boolean,
        decision: Decision,
        reason: DropReason,
        tickMs: Long,
        stats: ImageStats?,
        isMoving: Boolean,
        isShaking: Boolean,
        shake: Float,
        frameDiff: Float,
        attitude: AttitudeSnapshot,
        sectorId: Int,
        sectorName: String,
        sectorsFilled: Set<Int>,
        scenarioActive: Boolean,
        uniqueDistance: Int,
        worthyCount: Int,
        dropCount: Int,
        cameraFps: Float,
        analysisFps: Float,
        pack: OnDevicePack,
        captureRequest: CaptureRequest?,
        hintScores: HintScores,
        ocrText: String,
        sendReady: Boolean,
    ): ContextPacket =
        ContextPacket(
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
            packVersion = pack.version,
            captureRequestId = captureRequest?.id,
            coach = captureRequest?.coach.orEmpty(),
            colorMatch = hintScores.colorMatch,
            shapeMatch = hintScores.shapeMatch,
            textMatch = hintScores.textMatch,
            poseErrDeg = hintScores.poseErrDeg,
            hintFailLabel = hintScores.failLabel,
            ocrText = ocrText.take(200),
            sendReady = sendReady,
        )

    fun log(packet: ContextPacket) {
        Log.i(TAG, packet.toJson().toString())
    }
}
