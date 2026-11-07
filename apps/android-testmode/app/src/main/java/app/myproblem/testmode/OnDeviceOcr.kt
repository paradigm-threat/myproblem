package app.myproblem.testmode

import android.graphics.BitmapFactory
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.util.concurrent.atomic.AtomicBoolean

/**
 * ML Kit Latin OCR capability — invoke sparsely on kept candidate frames only.
 * Unbundled Play Services model; first call may download weights.
 */
class OnDeviceOcr {
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    private val busy = AtomicBoolean(false)

    @Volatile
    var lastText: String = ""
        private set

    @Volatile
    var lastMs: Long = 0L
        private set

    fun tryRecognizeJpeg(
        jpeg: ByteArray,
        onResult: (text: String, changed: Boolean) -> Unit,
    ): Boolean {
        if (!busy.compareAndSet(false, true)) return false
        val bitmap = BitmapFactory.decodeByteArray(jpeg, 0, jpeg.size)
        if (bitmap == null) {
            busy.set(false)
            return false
        }
        val image = InputImage.fromBitmap(bitmap, 0)
        recognizer
            .process(image)
            .addOnSuccessListener { result ->
                val text = result.text.trim().replace(Regex("\\s+"), " ")
                val changed = text != lastText
                lastText = text
                lastMs = System.currentTimeMillis()
                onResult(text, changed)
            }
            .addOnFailureListener { e ->
                Log.w(TAG, "OCR failed", e)
                onResult(lastText, false)
            }
            .addOnCompleteListener {
                if (!bitmap.isRecycled) bitmap.recycle()
                busy.set(false)
            }
        return true
    }

    fun close() {
        recognizer.close()
    }

    companion object {
        private const val TAG = "MyProblemOcr"
        const val MIN_INTERVAL_MS = 500L
        const val MAX_REJECTED = 32
    }
}
