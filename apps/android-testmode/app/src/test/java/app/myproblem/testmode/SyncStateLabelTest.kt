package app.myproblem.testmode

import app.myproblem.testmode.tickets.SyncHealth
import app.myproblem.testmode.tickets.SyncPresence
import app.myproblem.testmode.tickets.SyncState
import app.myproblem.testmode.tickets.chipLabel
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class SyncStateLabelTest {
    @Test
    fun localOnlyAhead_label() {
        val s =
            SyncState(
                presence = SyncPresence.LOCAL_ONLY,
                health = SyncHealth.LOCAL_AHEAD,
                localRevision = 1,
                remoteRevision = 0,
            )
        assertThat(s.chipLabel()).isEqualTo("Local only")
    }

    @Test
    fun onlineInSync_label() {
        val s =
            SyncState(
                presence = SyncPresence.ONLINE,
                health = SyncHealth.IN_SYNC,
                localRevision = 3,
                remoteRevision = 3,
                serverTicketId = "srv_abc",
            )
        assertThat(s.chipLabel()).isEqualTo("Synced")
    }

    @Test
    fun syncingUpload_label() {
        val s =
            SyncState(
                presence = SyncPresence.ONLINE,
                health = SyncHealth.SYNCING,
                localRevision = 4,
                remoteRevision = 3,
                progress = 0.4f,
            )
        assertThat(s.chipLabel()).isEqualTo("Uploading…")
    }

    @Test
    fun syncingPull_label() {
        val s =
            SyncState(
                presence = SyncPresence.ONLINE,
                health = SyncHealth.SYNCING,
                localRevision = 3,
                remoteRevision = 4,
            )
        assertThat(s.chipLabel()).isEqualTo("Updating…")
    }
}
