package app.myproblem.testmode.audio

import android.media.MediaRecorder
import java.io.File

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
