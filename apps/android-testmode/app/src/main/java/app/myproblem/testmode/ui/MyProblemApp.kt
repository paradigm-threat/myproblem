package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import app.myproblem.testmode.AppViewModel
import app.myproblem.testmode.BuildFlags
import app.myproblem.testmode.TestModeScreen
import app.myproblem.testmode.TestModeViewModel
import app.myproblem.testmode.tickets.CurrentAsk
import app.myproblem.testmode.tickets.SiteLayout
import app.myproblem.testmode.tickets.StartMode
import app.myproblem.testmode.tickets.SyncState
import java.util.concurrent.ExecutorService

object Routes {
    const val ONBOARDING = "onboarding"
    /** Primary Asker surface: public Clevertree/IRC room WebView. */
    const val HOME = "home"
    /** Secondary list of batch-opened (or legacy) tickets — not the submit SoT. */
    const val TICKETS = "tickets"
    const val NETWORKER = "networker"
    const val NETWORKER_ACTION = "networker/action/{ticketId}"
    const val SETTINGS = "settings"
    const val TEST = "test"
    /** Legacy tip-mint capture — kept for debug/E2E only; not linked from product home. */
    const val NEW_MODE = "new/mode"
    const val NEW_TEXT = "new/text"
    const val NEW_AUDIO = "new/audio/{ticketId}"
    const val NEW_AV = "new/av/{ticketId}"
    const val NEW_VIDEO = "new/video/{ticketId}"
    const val TICKET = "ticket/{ticketId}"

    fun newAudio(id: String) = "new/audio/$id"

    fun newAv(id: String) = "new/av/$id"

    fun newVideo(id: String) = "new/video/$id"

    fun ticket(id: String) = "ticket/$id"

    fun networkerAction(id: String) = "networker/action/$id"
}

@Composable
fun MyProblemApp(
    appVm: AppViewModel = viewModel(),
    testVm: TestModeViewModel = viewModel(),
    analysisExecutor: ExecutorService,
    onEnsureCameraForTest: () -> Unit,
    onToggleTestFeed: (Boolean) -> Unit,
    openTicketId: String? = null,
) {
    val ui by appVm.uiState.collectAsState()
    val testState by testVm.state.collectAsState()
    val nav = rememberNavController()

    val backStackEntry by nav.currentBackStackEntryAsState()
    LaunchedEffect(ui.ready, openTicketId) {
        if (ui.ready && !openTicketId.isNullOrBlank()) {
            nav.navigate(Routes.ticket(openTicketId)) {
                launchSingleTop = true
            }
        }
    }
    LaunchedEffect(backStackEntry, ui.ready) {
        if (ui.ready && backStackEntry == null && openTicketId.isNullOrBlank()) {
            nav.navigate(Routes.HOME) { launchSingleTop = true }
        }
    }

    MaterialTheme(colorScheme = darkColorScheme(background = Bg, primary = Accent)) {
        Box(
            Modifier
                .fillMaxSize()
                .background(Bg),
        ) {
            if (!ui.ready) {
                Column(
                    Modifier
                        .fillMaxSize()
                        .statusBarsPadding()
                        .padding(16.dp),
                ) {
                    Text("Loading…", color = Muted)
                }
                return@Box
            }

            NavHost(
                navController = nav,
                startDestination =
                    when {
                        !openTicketId.isNullOrBlank() -> Routes.ticket(openTicketId)
                        !ui.onboarded -> Routes.ONBOARDING
                        ui.homeMode == "networker" -> Routes.NETWORKER
                        else -> Routes.HOME
                    },
                modifier = Modifier.fillMaxSize().background(Bg),
            ) {
                composable(Routes.ONBOARDING) {
                    OnboardingScreen(
                        onDone = { mode, networker ->
                            appVm.completeOnboarding(mode, networker)
                            nav.navigate(if (networker) Routes.NETWORKER else Routes.HOME) {
                                popUpTo(Routes.ONBOARDING) { inclusive = true }
                            }
                        },
                    )
                }
                composable(Routes.HOME) {
                    RoomScreen(
                        ticketCount = appVm.visibleTickets().size,
                        networkerEnabled = ui.networkerEnabled,
                        onTickets = { nav.navigate(Routes.TICKETS) },
                        onSettings = { nav.navigate(Routes.SETTINGS) },
                        showDevTools = BuildFlags.SHOW_DEV_TOOLS,
                        onTestMode = {
                            if (BuildFlags.SHOW_DEV_TOOLS) {
                                onEnsureCameraForTest()
                                nav.navigate(Routes.TEST)
                            }
                        },
                        onNetworkerHome = {
                            appVm.setHomeMode("networker")
                            nav.navigate(Routes.NETWORKER) {
                                popUpTo(Routes.HOME) { inclusive = true }
                            }
                        },
                    )
                }
                composable(Routes.TICKETS) {
                    HomeScreen(
                        tickets = appVm.visibleTickets(),
                        showArchived = ui.showArchived,
                        onOpenTicket = { nav.navigate(Routes.ticket(it)) },
                        onBackToRoom = {
                            nav.popBackStack(Routes.HOME, inclusive = false)
                        },
                        onSettings = { nav.navigate(Routes.SETTINGS) },
                        onRetrySync = { appVm.retrySync(it) },
                    )
                }
                composable(Routes.NETWORKER) {
                    val widthDp = LocalConfiguration.current.screenWidthDp
                    var selected by remember { mutableStateOf<String?>(null) }
                    NetworkerHomeScreen(
                        tips = appVm.networkerNeedsHelp(),
                        selectedId = selected,
                        wide = widthDp >= SiteLayout.DESKTOP_MIN_PX,
                        onSelect = { selected = it },
                        onAddEvidence = { id ->
                            nav.navigate(Routes.ticket(id))
                        },
                        onAddAction = { id ->
                            nav.navigate(Routes.networkerAction(id))
                        },
                        onAskerHome = {
                            appVm.setHomeMode("asker")
                            nav.navigate(Routes.HOME) {
                                popUpTo(Routes.NETWORKER) { inclusive = true }
                            }
                        },
                        onSettings = { nav.navigate(Routes.SETTINGS) },
                    )
                }
                composable(
                    Routes.NETWORKER_ACTION,
                    arguments = listOf(navArgument("ticketId") { type = NavType.StringType }),
                ) { entry ->
                    val id = entry.arguments?.getString("ticketId") ?: return@composable
                    var note by remember { mutableStateOf("") }
                    Column(
                        Modifier
                            .fillMaxSize()
                            .background(Bg)
                            .statusBarsPadding()
                            .padding(16.dp),
                    ) {
                        Text(
                            "← Back",
                            color = Muted,
                            modifier = Modifier.clickable { nav.popBackStack() },
                        )
                        Text(
                            "I took an action",
                            color = Warm,
                            fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
                            fontSize = 22.sp,
                            modifier = Modifier.padding(vertical = 12.dp),
                        )
                        OutlinedTextField(
                            value = note,
                            onValueChange = { note = it },
                            modifier = Modifier.fillMaxWidth().height(140.dp),
                            placeholder = { Text("I set a trap near the fence…", color = Muted) },
                            colors =
                                OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Warm,
                                    unfocusedTextColor = Warm,
                                    focusedBorderColor = Accent,
                                    unfocusedBorderColor = Muted,
                                ),
                        )
                        Spacer(Modifier.height(12.dp))
                        PrimaryButton("Add to tip", onClick = {
                            appVm.appendNetworkerAction(id, note)
                            nav.popBackStack()
                        })
                    }
                }
                composable(Routes.NEW_MODE) {
                    NewTicketModeScreen(
                        onCancel = { nav.popBackStack() },
                        onChoose = { mode ->
                            when (mode) {
                                StartMode.TEXT ->
                                    nav.navigate(Routes.NEW_TEXT) {
                                        popUpTo(Routes.NEW_MODE) { inclusive = true }
                                    }
                                StartMode.AUDIO -> {
                                    val t = appVm.beginAudioTicket()
                                    nav.navigate(Routes.newAudio(t.id)) {
                                        popUpTo(Routes.NEW_MODE) { inclusive = true }
                                    }
                                }
                                StartMode.AUDIO_FRAMES -> {
                                    val t = appVm.beginAvTicket()
                                    nav.navigate(Routes.newAv(t.id)) {
                                        popUpTo(Routes.NEW_MODE) { inclusive = true }
                                    }
                                }
                                StartMode.VIDEO_MESSAGE -> {
                                    val t = appVm.beginVideoMessage()
                                    nav.navigate(Routes.newVideo(t.id)) {
                                        popUpTo(Routes.NEW_MODE) { inclusive = true }
                                    }
                                }
                            }
                        },
                    )
                }
                composable(Routes.SETTINGS) {
                    SettingsScreen(
                        showArchived = ui.showArchived,
                        onlineSyncEnabled = ui.onlineSyncEnabled,
                        networkerEnabled = ui.networkerEnabled,
                        onShowArchived = appVm::setShowArchived,
                        onOnlineSyncEnabled = appVm::setOnlineSyncEnabled,
                        onNetworkerEnabled = appVm::setNetworkerEnabled,
                        onBack = { nav.popBackStack() },
                    )
                }
                composable(Routes.NEW_TEXT) {
                    NewTicketTextScreen(
                        onCancel = { nav.popBackStack() },
                        onSubmit = { title, desc ->
                            val t = appVm.createTextTicket(title, desc)
                            nav.navigate(Routes.ticket(t.id)) {
                                popUpTo(Routes.HOME)
                            }
                        },
                    )
                }
                composable(
                    Routes.NEW_AUDIO,
                    arguments = listOf(navArgument("ticketId") { type = NavType.StringType }),
                ) { entry ->
                    val id = entry.arguments?.getString("ticketId") ?: return@composable
                    val live = ui.tickets.find { it.id == id } ?: appVm.ticket(id)
                    if (live == null) {
                        LaunchedEffect(id) {
                            nav.popBackStack(Routes.HOME, inclusive = false)
                        }
                        return@composable
                    }
                    NewTicketAudioScreen(
                        ticket = live,
                        audioFileFactory = { appVm.audioFileFor(id) },
                        onCancel = {
                            appVm.closeTicket(id)
                            nav.popBackStack()
                        },
                        onStop = { file ->
                            appVm.stopAudioRecording(id, file)
                            nav.navigate(Routes.ticket(id)) {
                                popUpTo(Routes.HOME)
                            }
                        },
                        onEditProposed = {
                            nav.navigate(Routes.ticket(id)) {
                                popUpTo(Routes.HOME)
                            }
                        },
                        onRetrySync = { appVm.retrySync(id) },
                    )
                }
                composable(
                    Routes.NEW_AV,
                    arguments = listOf(navArgument("ticketId") { type = NavType.StringType }),
                ) { entry ->
                    val id = entry.arguments?.getString("ticketId") ?: return@composable
                    var stills by remember { mutableStateOf(appVm.ticket(id)?.stillCount ?: 0) }
                    LaunchedEffect(ui.tickets) {
                        stills = appVm.ticket(id)?.stillCount ?: stills
                    }
                    DisposableEffect(Unit) {
                        onDispose {
                            // Ensure mic/camera cleanup paths run when leaving.
                        }
                    }
                    val live = ui.tickets.firstOrNull { it.id == id }
                    val ask = live?.let { CurrentAsk.forTicket(it) } ?: CurrentAsk.OPENING
                    NewTicketAvScreen(
                        ticketId = id,
                        stillCount = stills,
                        ask = ask,
                        sync = live?.sync ?: SyncState(),
                        audioFileFactory = { appVm.audioFileFor(id) },
                        stillFileFactory = { appVm.stillFileFor(id) },
                        onCancel = {
                            appVm.closeTicket(id)
                            nav.popBackStack()
                        },
                        onAudioRecorded = { appVm.onAudioCaptured(id, it) },
                        onRollingClip = { appVm.onRollingClip(id, it) },
                        onStillCaptured = {
                            appVm.onStillCaptured(id, it)
                            stills += 1
                        },
                        onRefreshAsk = { appVm.refreshAsk(id) },
                        onRetrySync = { appVm.retrySync(id) },
                        onFinish = {
                            appVm.runIntakeAgain(id)
                            nav.navigate(Routes.ticket(id)) {
                                popUpTo(Routes.HOME)
                            }
                        },
                    )
                }
                composable(
                    Routes.NEW_VIDEO,
                    arguments = listOf(navArgument("ticketId") { type = NavType.StringType }),
                ) { entry ->
                    val id = entry.arguments?.getString("ticketId") ?: return@composable
                    var sending by remember { mutableStateOf(false) }
                    var sendError by remember { mutableStateOf<String?>(null) }
                    VideoMessageScreen(
                        fileFactory = { appVm.videoFileFor(id) },
                        sending = sending,
                        error = sendError,
                        onCancel = {
                            appVm.discardVideoMessage(id)
                            nav.popBackStack()
                        },
                        onSend = { file ->
                            sending = true
                            sendError = null
                            val sent = appVm.sendVideoMessage(id, file)
                            sending = false
                            if (sent == null) {
                                sendError = "Couldn't send. The recording stays on this phone."
                            } else {
                                nav.navigate(Routes.ticket(id)) {
                                    popUpTo(Routes.HOME)
                                }
                            }
                        },
                    )
                }
                composable(
                    Routes.TICKET,
                    arguments = listOf(navArgument("ticketId") { type = NavType.StringType }),
                ) { entry ->
                    val id = entry.arguments?.getString("ticketId") ?: return@composable
                    val ticket = ui.tickets.find { it.id == id } ?: appVm.ticket(id)
                    if (ticket == null) {
                        LaunchedEffect(id) {
                            nav.popBackStack(Routes.HOME, inclusive = false)
                        }
                        Text(
                            "Ticket missing — returning home…",
                            color = Danger,
                            modifier = Modifier.padding(16.dp),
                        )
                        return@composable
                    }
                    TicketDetailScreen(
                        ticket = ticket,
                        onBack = {
                            if (!nav.popBackStack()) {
                                nav.navigate(Routes.TICKETS)
                            }
                        },
                        onManualFill = { title, desc -> appVm.applyManualFill(id, title, desc) },
                        onAnswer = { q, a -> appVm.answerQuestion(id, q, a) },
                        onClose = {
                            appVm.closeTicket(id)
                            nav.navigate(Routes.TICKETS) {
                                popUpTo(Routes.HOME)
                            }
                        },
                        onReopen = { appVm.reopenTicket(id) },
                        onRunIntake = { appVm.runIntakeAgain(id) },
                        onRetrySync = { appVm.retrySync(id) },
                        onSimulateRemoteAhead = { appVm.simulateRemoteAhead(id) },
                        onRequestReprocess = { note, names ->
                            appVm.requestReprocess(
                                ticketId = id,
                                requestedBy = "user",
                                addedNames =
                                    names.split(',').map { it.trim() }.filter { it.isNotEmpty() },
                                newUserNote = note.ifBlank { null },
                            )
                        },
                    )
                }
                composable(Routes.TEST) {
                    DisposableEffect(Unit) {
                        onDispose {
                            if (testVm.state.value.feedOn) {
                                testVm.setFeedOn(false)
                            }
                        }
                    }
                    Column(Modifier.fillMaxSize().background(Bg)) {
                        Text(
                            "← Room",
                            color = Muted,
                            fontSize = 14.sp,
                            modifier =
                                Modifier
                                    .statusBarsPadding()
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                                    .clickable {
                                        if (testVm.state.value.feedOn) {
                                            testVm.setFeedOn(false)
                                        }
                                        nav.popBackStack()
                                    },
                        )
                        Box(Modifier.weight(1f).fillMaxSize()) {
                            TestModeScreen(
                                state = testState,
                                onToggleFeed = { onToggleTestFeed(testState.feedOn) },
                                onToggleScenario = { testVm.toggleScenario() },
                                onCycleDebugHint = { testVm.cycleDebugHint() },
                                onReset = { testVm.resetSession() },
                                analysisExecutor = analysisExecutor,
                                imageAnalyzer = testVm.imageAnalyzer,
                                feedOn = testState.feedOn,
                            )
                        }
                    }
                }
            }
        }
    }
}
