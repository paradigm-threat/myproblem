package app.myproblem.testmode

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
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

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            vm.setPermissionNeeded(!granted)
            if (!granted) {
                vm.setError("Camera permission required for Test Mode")
            } else {
                vm.setError(null)
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ensureCameraPermission()
        setContent {
            val state by vm.state.collectAsState()
            TestModeScreen(
                state = state,
                onToggleFeed = {
                    if (hasCameraPermission()) {
                        vm.toggleFeed()
                    } else {
                        ensureCameraPermission()
                    }
                },
                onToggleScenario = { vm.toggleScenario() },
                onCycleDebugHint = { vm.cycleDebugHint() },
                onReset = { vm.resetSession() },
                analysisExecutor = vm.analysisExecutor,
                imageAnalyzer = vm.imageAnalyzer,
                feedOn = state.feedOn,
            )
        }
    }

    private fun hasCameraPermission(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED

    private fun ensureCameraPermission() {
        if (hasCameraPermission()) {
            vm.setPermissionNeeded(false)
        } else {
            vm.setPermissionNeeded(true)
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }
}
