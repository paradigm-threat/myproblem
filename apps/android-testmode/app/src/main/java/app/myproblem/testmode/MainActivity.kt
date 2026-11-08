package app.myproblem.testmode

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import app.myproblem.testmode.ui.MyProblemApp

class MainActivity : ComponentActivity() {
    private val appVm: AppViewModel by viewModels()
    private val testVm: TestModeViewModel by viewModels()

    private var startFeedAfterPermission = false

    private val cameraPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            testVm.setPermissionNeeded(!granted)
            if (!granted) {
                startFeedAfterPermission = false
                testVm.setError("Camera permission required — choose While using the app")
                toast("Camera permission needed")
                Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"permission","granted":false}""")
            } else {
                testVm.setError(null)
                Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"permission","granted":true}""")
                if (startFeedAfterPermission) {
                    startFeedAfterPermission = false
                    testVm.setFeedOn(true)
                    toast("Starting feed…")
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyProblemApp(
                appVm = appVm,
                testVm = testVm,
                analysisExecutor = testVm.analysisExecutor,
                onEnsureCameraForTest = { ensureCameraPermission(requestIfMissing = true) },
                onToggleTestFeed = { feedOn -> onToggleFeedClicked(feedOn) },
            )
        }
    }

    private fun onToggleFeedClicked(feedOn: Boolean) {
        if (feedOn) {
            Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"stop_feed"}""")
            toast("Stopping feed…")
            testVm.setFeedOn(false)
            return
        }
        Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"start_feed"}""")
        if (hasCameraPermission()) {
            toast("Starting feed…")
            testVm.setFeedOn(true)
        } else {
            startFeedAfterPermission = true
            testVm.setPermissionNeeded(true)
            toast("Requesting camera…")
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun hasCameraPermission(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED

    private fun ensureCameraPermission(requestIfMissing: Boolean) {
        if (hasCameraPermission()) {
            testVm.setPermissionNeeded(false)
        } else {
            testVm.setPermissionNeeded(true)
            if (requestIfMissing) {
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun toast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }
}
