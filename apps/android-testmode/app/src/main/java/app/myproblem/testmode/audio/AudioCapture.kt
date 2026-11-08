package app.myproblem.testmode.audio

import android.media.MediaRecorder
import java.io.File
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min

class AudioCapture {
    private var recorder: MediaRecorder? = null
    var outputFile: File? = null
        private set
    var isRecording: Boolean = false
        private set

    @Suppress("DEPRECATION")
    fun start(file: File) {
        stop()
        outputFile = file
        val rec = MediaRecorder()
        rec.setAudioSource(MediaRecorder.AudioSource.MIC)
        rec.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        rec.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
        rec.setAudioEncodingBitRate(128_000)
        rec.setAudioSamplingRate(44_100)
        rec.setOutputFile(file.absolutePath)
        rec.prepare()
        rec.start()
        recorder = rec
        isRecording = true
    }

    /** 0f..1f smoothed level from MediaRecorder max amplitude. */
    fun level01(): Float {
        val rec = recorder ?: return 0f
        if (!isRecording) return 0f
        return try {
            val amp = rec.maxAmplitude // 0..32767
            if (amp <= 0) 0f
            else {
                // Log scale so quiet speech still moves the bars
                val n = ln(1.0 + amp) / ln(1.0 + 32767.0)
                min(1f, max(0f, n.toFloat()))
            }
        } catch (_: Exception) {
            0f
        }
    }

    fun stop(): File? {
        val f = outputFile
        try {
            recorder?.apply {
                stop()
                release()
            }
        } catch (_: Exception) {
            // ignore incomplete recordings
        }
        recorder = null
        isRecording = false
        return f?.takeIf { it.exists() && it.length() > 0 }
    }
}
