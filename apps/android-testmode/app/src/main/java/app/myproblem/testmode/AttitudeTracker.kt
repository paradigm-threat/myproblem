package app.myproblem.testmode

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlin.math.sqrt

/**
 * Gyro + rotation vector → pitch/roll/yaw and shake magnitude.
 * All motion judgments for the gate happen here / in FrameAnalyzer — not on a server.
 */
class AttitudeTracker(context: Context) : SensorEventListener {
    private val sensorManager =
        context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

    @Volatile var pitchDeg: Float = 0f
        private set
    @Volatile var rollDeg: Float = 0f
        private set
    @Volatile var yawDeg: Float = 0f
        private set
    @Volatile var gyroMag: Float = 0f
        private set
    @Volatile var shakeScore: Float = 0f
        private set

    private val rotation = FloatArray(9)
    private val orientation = FloatArray(3)
    private var shakeEma = 0f

    fun start() {
        sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)?.also {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
        sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)?.also {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
    }

    fun stop() {
        sensorManager.unregisterListener(this)
        gyroMag = 0f
        shakeScore = 0f
        shakeEma = 0f
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ROTATION_VECTOR -> {
                SensorManager.getRotationMatrixFromVector(rotation, event.values)
                SensorManager.getOrientation(rotation, orientation)
                // orientation: [azimuth, pitch, roll] in radians
                yawDeg = Math.toDegrees(orientation[0].toDouble()).toFloat()
                pitchDeg = Math.toDegrees(orientation[1].toDouble()).toFloat()
                rollDeg = Math.toDegrees(orientation[2].toDouble()).toFloat()
            }
            Sensor.TYPE_GYROSCOPE -> {
                val x = event.values[0]
                val y = event.values[1]
                val z = event.values[2]
                gyroMag = sqrt(x * x + y * y + z * z)
                shakeEma = 0.75f * shakeEma + 0.25f * gyroMag
                shakeScore = shakeEma
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
}
