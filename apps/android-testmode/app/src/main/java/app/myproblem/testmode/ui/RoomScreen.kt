package app.myproblem.testmode.ui

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import app.myproblem.testmode.BuildFlags
import app.myproblem.testmode.chat.ChatEndpoints

/**
 * Primary Asker surface: public Clevertree/IRC room (default `#mp-general`).
 * Type / speak / video go through the same web room → Bunny → `/api/chat/post`.
 */
@Composable
fun RoomScreen(
    ticketCount: Int,
    networkerEnabled: Boolean,
    onTickets: () -> Unit,
    onSettings: () -> Unit,
    onNetworkerHome: (() -> Unit)? = null,
    showDevTools: Boolean = BuildFlags.SHOW_DEV_TOOLS,
    onTestMode: (() -> Unit)? = null,
    roomUrl: String = ChatEndpoints.APK_ROOM_URL,
) {
    val context = LocalContext.current
    var pendingPermission by remember { mutableStateOf<PermissionRequest?>(null) }
    val permissionLauncher =
        rememberLauncherForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions(),
        ) { grants ->
            val req = pendingPermission
            pendingPermission = null
            if (req == null) return@rememberLauncherForActivityResult
            val ok =
                grants[Manifest.permission.CAMERA] == true ||
                    grants[Manifest.permission.RECORD_AUDIO] == true ||
                    ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                    PackageManager.PERMISSION_GRANTED ||
                    ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
            if (ok) {
                req.grant(req.resources)
            } else {
                req.deny()
            }
        }

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .background(Bg)
                .statusBarsPadding()
                .navigationBarsPadding(),
    ) {
        Row(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text("MyProblem", color = Accent, fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
                Text(
                    ChatEndpoints.DEFAULT_IRC_CHANNEL,
                    color = Mint,
                    fontSize = 12.sp,
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(
                    if (ticketCount > 0) "Tickets ($ticketCount)" else "Tickets",
                    color = Muted,
                    modifier = Modifier.clickable(onClick = onTickets),
                )
                Text("Settings", color = Muted, modifier = Modifier.clickable(onClick = onSettings))
                if (showDevTools && onTestMode != null) {
                    Text("Test", color = Muted, modifier = Modifier.clickable(onClick = onTestMode))
                }
            }
        }
        Text(
            "Public chat + AI are free. Ask here — tickets are only opened when the batch needs one.",
            color = Muted,
            fontSize = 12.sp,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
        )
        Box(Modifier.weight(1f).fillMaxSize()) {
            RoomWebView(
                url = roomUrl,
                onPermissionRequest = { request ->
                    val needCamera =
                        request.resources.any {
                            it == PermissionRequest.RESOURCE_VIDEO_CAPTURE
                        }
                    val needMic =
                        request.resources.any {
                            it == PermissionRequest.RESOURCE_AUDIO_CAPTURE
                        }
                    val missing = mutableListOf<String>()
                    if (needCamera &&
                        ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) !=
                        PackageManager.PERMISSION_GRANTED
                    ) {
                        missing += Manifest.permission.CAMERA
                    }
                    if (needMic &&
                        ContextCompat.checkSelfPermission(
                            context,
                            Manifest.permission.RECORD_AUDIO,
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        missing += Manifest.permission.RECORD_AUDIO
                    }
                    if (missing.isEmpty()) {
                        request.grant(request.resources)
                    } else {
                        pendingPermission = request
                        permissionLauncher.launch(missing.toTypedArray())
                    }
                },
            )
        }
        if (networkerEnabled && onNetworkerHome != null) {
            Row(
                modifier =
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
            ) {
                Text("Room", color = Accent, fontWeight = FontWeight.SemiBold)
                Text(
                    "Networker",
                    color = Muted,
                    modifier = Modifier.clickable(onClick = onNetworkerHome),
                )
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun RoomWebView(
    url: String,
    onPermissionRequest: (PermissionRequest) -> Unit,
) {
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                layoutParams =
                    ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT,
                    )
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                settings.cacheMode = WebSettings.LOAD_DEFAULT
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                webViewClient = WebViewClient()
                webChromeClient =
                    object : WebChromeClient() {
                        override fun onPermissionRequest(request: PermissionRequest?) {
                            if (request == null) return
                            onPermissionRequest(request)
                        }
                    }
                loadUrl(url)
            }
        },
        modifier = Modifier.fillMaxSize(),
        update = { webView ->
            if (webView.url != url) {
                webView.loadUrl(url)
            }
        },
    )
}
