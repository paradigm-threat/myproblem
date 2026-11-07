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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private val vm: TestModeViewModel by viewModels()

    /** Start feed as soon as the user grants camera (no second tap). */
    private var startFeedAfterPermission = false

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            vm.setPermissionNeeded(!granted)
            if (!granted) {
                startFeedAfterPermission = false
                vm.setError("Camera permission required — choose While using the app")
                toast("Camera permission needed")
                Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"permission","granted":false}""")
            } else {
                vm.setError(null)
                Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"permission","granted":true}""")
                if (startFeedAfterPermission) {
                    startFeedAfterPermission = false
                    vm.setFeedOn(true)
                    toast("Starting feed…")
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ensureCameraPermission(requestIfMissing = true)
        setContent {
            val state by vm.state.collectAsState()
            TestModeScreen(
                state = state,
                onToggleFeed = { onToggleFeedClicked(state.feedOn) },
                onToggleScenario = { vm.toggleScenario() },
                onCycleDebugHint = { vm.cycleDebugHint() },
                onReset = { vm.resetSession() },
                analysisExecutor = vm.analysisExecutor,
                imageAnalyzer = vm.imageAnalyzer,
                feedOn = state.feedOn,
            )
        }
    }

    private fun onToggleFeedClicked(feedOn: Boolean) {
        if (feedOn) {
            Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"stop_feed"}""")
            toast("Stopping feed…")
            vm.setFeedOn(false)
            return
        }
        Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"start_feed"}""")
        if (hasCameraPermission()) {
            toast("Starting feed…")
            vm.setFeedOn(true)
        } else {
            startFeedAfterPermission = true
            vm.setPermissionNeeded(true)
            toast("Requesting camera…")
            Log.i(ContextBuilder.TAG, """{"event":"ui_tap","action":"permission"}""")
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun hasCameraPermission(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED

    private fun ensureCameraPermission(requestIfMissing: Boolean) {
        if (hasCameraPermission()) {
            vm.setPermissionNeeded(false)
        } else {
            vm.setPermissionNeeded(true)
            if (requestIfMissing) {
                permissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun toast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }
}
