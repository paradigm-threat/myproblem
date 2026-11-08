package app.myproblem.testmode.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import app.myproblem.testmode.AppViewModel
import app.myproblem.testmode.TestModeScreen
import app.myproblem.testmode.TestModeViewModel
import app.myproblem.testmode.tickets.StartMode
import java.util.concurrent.ExecutorService

object Routes {
    const val ONBOARDING = "onboarding"
    const val HOME = "home"
    const val SETTINGS = "settings"
    const val TEST = "test"
    const val NEW_TEXT = "new/text"
    const val NEW_AUDIO = "new/audio/{ticketId}"
    const val NEW_AV = "new/av/{ticketId}"
    const val TICKET = "ticket/{ticketId}"

    fun newAudio(id: String) = "new/audio/$id"

    fun newAv(id: String) = "new/av/$id"

    fun ticket(id: String) = "ticket/$id"
}

@Composable
fun MyProblemApp(
    appVm: AppViewModel = viewModel(),
    testVm: TestModeViewModel = viewModel(),
    analysisExecutor: ExecutorService,
    onEnsureCameraForTest: () -> Unit,
    onToggleTestFeed: (Boolean) -> Unit,
) {
    val ui by appVm.uiState.collectAsState()
    val testState by testVm.state.collectAsState()
    val nav = rememberNavController()

    MaterialTheme(colorScheme = darkColorScheme(background = Bg, primary = Accent)) {
        if (!ui.ready) {
            Column(
                Modifier
                    .fillMaxSize()
                    .background(Bg)
                    .statusBarsPadding()
                    .padding(16.dp),
            ) {
                Text("Loading…", color = Muted)
            }
            return@MaterialTheme
        }

        val start = if (ui.onboarded) Routes.HOME else Routes.ONBOARDING

        NavHost(navController = nav, startDestination = start) {
            composable(Routes.ONBOARDING) {
                OnboardingScreen { mode ->
                    appVm.completeOnboarding(mode)
                    nav.navigate(Routes.HOME) {
                        popUpTo(Routes.ONBOARDING) { inclusive = true }
                    }
                }
            }
            composable(Routes.HOME) {
                HomeScreen(
                    tickets = appVm.visibleTickets(),
                    showArchived = ui.showArchived,
                    onNewTicket = {
                        when (ui.startMode) {
                            StartMode.TEXT -> nav.navigate(Routes.NEW_TEXT)
                            StartMode.AUDIO -> {
                                val t = appVm.beginAudioTicket()
                                nav.navigate(Routes.newAudio(t.id))
                            }
                            StartMode.AUDIO_FRAMES -> {
                                val t = appVm.beginAvTicket()
                                nav.navigate(Routes.newAv(t.id))
                            }
                        }
                    },
                    onOpenTicket = { nav.navigate(Routes.ticket(it)) },
                    onSettings = { nav.navigate(Routes.SETTINGS) },
                    onTestMode = {
                        onEnsureCameraForTest()
                        nav.navigate(Routes.TEST)
                    },
                )
            }
            composable(Routes.SETTINGS) {
                SettingsScreen(
                    startMode = ui.startMode,
                    showArchived = ui.showArchived,
                    onlineSyncEnabled = ui.onlineSyncEnabled,
                    onStartMode = appVm::setStartMode,
                    onShowArchived = appVm::setShowArchived,
                    onOnlineSyncEnabled = appVm::setOnlineSyncEnabled,
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
                NewTicketAudioScreen(
                    ticketId = id,
                    audioFileFactory = { appVm.audioFileFor(id) },
                    onCancel = {
                        appVm.closeTicket(id)
                        nav.popBackStack()
                    },
                    onRecorded = { file ->
                        appVm.onAudioCaptured(id, file)
                        nav.navigate(Routes.ticket(id)) {
                            popUpTo(Routes.HOME)
                        }
                    },
                    onAddDetails = {
                        nav.navigate(Routes.ticket(id)) {
                            popUpTo(Routes.HOME)
                        }
                    },
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
                NewTicketAvScreen(
                    ticketId = id,
                    stillCount = stills,
                    audioFileFactory = { appVm.audioFileFor(id) },
                    stillFileFactory = { appVm.stillFileFor(id) },
                    onCancel = {
                        appVm.closeTicket(id)
                        nav.popBackStack()
                    },
                    onAudioRecorded = { appVm.onAudioCaptured(id, it) },
                    onStillCaptured = {
                        appVm.onStillCaptured(id, it)
                        stills += 1
                    },
                    onFinish = {
                        appVm.runIntakeAgain(id)
                        nav.navigate(Routes.ticket(id)) {
                            popUpTo(Routes.HOME)
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
                    Text("Ticket missing", color = Danger, modifier = Modifier.padding(16.dp))
                    return@composable
                }
                TicketDetailScreen(
                    ticket = ticket,
                    onBack = { nav.popBackStack(Routes.HOME, inclusive = false) },
                    onManualFill = { title, desc -> appVm.applyManualFill(id, title, desc) },
                    onAnswer = { q, a -> appVm.answerQuestion(id, q, a) },
                    onClose = {
                        appVm.closeTicket(id)
                        nav.popBackStack(Routes.HOME, inclusive = false)
                    },
                    onReopen = { appVm.reopenTicket(id) },
                    onRunIntake = { appVm.runIntakeAgain(id) },
                    onRetrySync = { appVm.retrySync(id) },
                    onSimulateRemoteAhead = { appVm.simulateRemoteAhead(id) },
                )
            }
            composable(Routes.TEST) {
                Column(Modifier.fillMaxSize().background(Bg)) {
                    Text(
                        "← Tickets",
                        color = Muted,
                        fontSize = 14.sp,
                        modifier =
                            Modifier
                                .statusBarsPadding()
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                                .clickable { nav.popBackStack() },
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
