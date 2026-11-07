package app.myproblem.testmode

data class AttitudeSnapshot(
    val pitchDeg: Float = 0f,
    val rollDeg: Float = 0f,
    val yawDeg: Float = 0f,
    val gyroMag: Float = 0f,
    val shakeScore: Float = 0f,
)

fun AttitudeTracker.snapshot(): AttitudeSnapshot =
    AttitudeSnapshot(
        pitchDeg = pitchDeg,
        rollDeg = rollDeg,
        yawDeg = yawDeg,
        gyroMag = gyroMag,
        shakeScore = shakeScore,
    )
