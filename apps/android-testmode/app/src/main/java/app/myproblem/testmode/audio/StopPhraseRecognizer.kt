package app.myproblem.testmode.audio

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import java.util.Locale

/**
 * On-device-ish listen for “stop recording” while the main MediaRecorder holds the mic.
 * Many devices refuse a second mic client — failures are soft; the Stop button remains SoT.
 */
class StopPhraseRecognizer(
    private val context: Context,
    private val onStopPhrase: () -> Unit,
) {
    private val main = Handler(Looper.getMainLooper())
    private var recognizer: SpeechRecognizer? = null
    private var active = false
    private var fired = false

    fun start() {
        if (active) return
        if (!SpeechRecognizer.isRecognitionAvailable(context)) return
        active = true
        fired = false
        main.post { bindAndListen() }
    }

    fun stop() {
        active = false
        main.removeCallbacksAndMessages(null)
        try {
            recognizer?.cancel()
            recognizer?.destroy()
        } catch (_: Exception) {
        }
        recognizer = null
    }

    private fun bindAndListen() {
        if (!active || fired) return
        try {
            recognizer?.destroy()
        } catch (_: Exception) {
        }
        val sr =
            try {
                SpeechRecognizer.createSpeechRecognizer(context)
            } catch (_: Exception) {
                null
            } ?: return
        recognizer = sr
        sr.setRecognitionListener(
            object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}

                override fun onBeginningOfSpeech() {}

                override fun onRmsChanged(rmsdB: Float) {}

                override fun onBufferReceived(buffer: ByteArray?) {}

                override fun onEndOfSpeech() {}

                override fun onError(error: Int) {
                    if (!active || fired) return
                    // Mic busy / no match — retry quietly.
                    main.postDelayed({ if (active && !fired) bindAndListen() }, 1_800L)
                }

                override fun onResults(results: Bundle?) {
                    handleHypotheses(results)
                    if (active && !fired) {
                        main.postDelayed({ bindAndListen() }, 400L)
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    handleHypotheses(partialResults)
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            },
        )
        val intent =
            Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
            }
        try {
            sr.startListening(intent)
        } catch (_: Exception) {
            main.postDelayed({ if (active && !fired) bindAndListen() }, 2_000L)
        }
    }

    private fun handleHypotheses(bundle: Bundle?) {
        if (fired || !active || bundle == null) return
        val texts = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION) ?: return
        if (texts.any { matchesStopPhrase(it) }) {
            fired = true
            active = false
            try {
                recognizer?.cancel()
            } catch (_: Exception) {
            }
            onStopPhrase()
        }
    }

    companion object {
        fun matchesStopPhrase(raw: String): Boolean {
            val n =
                raw.lowercase(Locale.US)
                    .replace(Regex("[^a-z\\s]"), " ")
                    .replace(Regex("\\s+"), " ")
                    .trim()
            return n.contains("stop recording") ||
                n == "stop" ||
                n.endsWith(" stop") ||
                n.startsWith("stop ")
        }
    }
}
