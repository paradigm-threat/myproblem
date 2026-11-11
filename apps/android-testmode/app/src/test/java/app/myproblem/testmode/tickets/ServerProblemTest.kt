package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ServerProblemTest {
    @Test
    fun timeoutIsSlow_andCopyHidesTheException() {
        val banner = explainServerFailure("java.net.SocketTimeoutException: timeout")
        assertThat(banner.problem).isEqualTo(ServerProblem.SLOW)
        assertThat(banner.title).isEqualTo("Server is slow")
        assertThat(banner.body).doesNotContain("SocketTimeout")
        assertThat(banner.body).doesNotContain("HTTP")
        val sync =
            SyncState(
                health = SyncHealth.ERROR,
                problem = banner.problem,
                lastError = banner.body,
            )
        assertThat(sync.chipLabel()).isEqualTo("Server slow")
        assertThat(sync.serverBanner()?.title).isEqualTo("Server is slow")
    }

    @Test
    fun connectionFailureIsUnavailable() {
        val banner = explainServerFailure("failed to connect to intake.myproblem.app")
        assertThat(banner.problem).isEqualTo(ServerProblem.UNAVAILABLE)
        assertThat(banner.title).isEqualTo("Server isn't available")
        assertThat(banner.body).contains("on this phone")
        val sync = SyncState(health = SyncHealth.ERROR, problem = banner.problem, lastError = banner.body)
        assertThat(sync.chipLabel()).isEqualTo("Server unavailable")
    }

    @Test
    fun gatewayTimeoutIsSlow_andBadGatewayIsUnavailable() {
        assertThat(classifyServerFailure("getTicket HTTP 504: ")).isEqualTo(ServerProblem.SLOW)
        assertThat(classifyServerFailure("createTicket HTTP 502: bad gateway")).isEqualTo(ServerProblem.UNAVAILABLE)
        assertThat(classifyServerFailure("Unable to resolve host")).isEqualTo(ServerProblem.UNAVAILABLE)
    }

    @Test
    fun stillSyncingPastTheThresholdShowsSlow() {
        val started = 1_000L
        val sync =
            SyncState(
                health = SyncHealth.SYNCING,
                syncStartedAtMs = started,
            )
        assertThat(sync.serverBanner(started + 1_000L)).isNull()
        val waiting = sync.serverBanner(started + SYNC_ERROR_AFTER_MS)
        assertThat(waiting?.problem).isEqualTo(ServerProblem.SLOW)
        assertThat(waiting?.waiting).isTrue()
        assertThat(waiting?.body).contains("keep talking")
    }

    @Test
    fun offlineSettingIsNotAServerOutage() {
        val banner = explainServerFailure("Offline — ticket stays on this device until online sync is available")
        assertThat(banner.title).isEqualTo("Phone is offline")
        assertThat(banner.body).contains("Online sync is off")
        val sync = SyncState(health = SyncHealth.ERROR, problem = banner.problem, lastError = banner.body)
        assertThat(sync.serverBanner()?.title).isEqualTo("Phone is offline")
    }

    @Test
    fun notUploadedYetHasItsOwnLine() {
        val banner = explainServerFailure("Not online yet — sync first")
        assertThat(banner.title).isEqualTo("Not on the server yet")
        assertThat(banner.body).contains("only on the phone")
    }
}
