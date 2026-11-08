package app.myproblem.testmode.tickets

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Auto-sync on mutation. Until real ticket APIs exist, [onlineEnabled] simulates a successful
 * push/pull; when false, tickets stay LOCAL_ONLY and time out to ERROR (retryable).
 */
class TicketSyncEngine(
    private val scope: CoroutineScope,
    private val store: LocalTicketStore,
    private val onUpdated: () -> Unit,
    private val onlineEnabled: () -> Boolean,
    private val syncLatencyMs: Long = 450L,
    private val errorAfterMs: Long = SYNC_ERROR_AFTER_MS,
) {
    private val jobs = ConcurrentHashMap<String, Job>()

    /** Call after any local save that bumps content. */
    fun markLocalChangeAndSync(ticketId: String) {
        val t = store.load(ticketId) ?: return
        val now = System.currentTimeMillis()
        val bumped =
            t.copy(
                sync =
                    t.sync.copy(
                        localRevision = t.sync.localRevision + 1,
                        health = SyncHealth.LOCAL_AHEAD,
                        lastError = null,
                        progress = null,
                        syncStartedAtMs = null,
                    ),
                updatedAtMs = now,
            )
        store.save(bumped)
        onUpdated()
        enqueueSync(ticketId)
    }

    /** Schedule sync without bumping revision (retry after error). */
    fun enqueueSync(ticketId: String) {
        jobs[ticketId]?.cancel()
        jobs[ticketId] =
            scope.launch {
                delay(120)
                runSync(ticketId)
            }
    }

    /** Simulate server pushing a newer revision (for QA / future pull). */
    fun simulateRemoteAhead(ticketId: String) {
        val t = store.load(ticketId) ?: return
        if (t.sync.presence != SyncPresence.ONLINE) return
        val next =
            t.copy(
                sync =
                    t.sync.copy(
                        remoteRevision = t.sync.localRevision + 1,
                        health = SyncHealth.REMOTE_AHEAD,
                        lastError = null,
                        progress = null,
                        syncStartedAtMs = null,
                    ),
                updatedAtMs = System.currentTimeMillis(),
            )
        store.save(next)
        onUpdated()
        enqueueSync(ticketId)
    }

    private suspend fun runSync(ticketId: String) {
        var t = store.load(ticketId) ?: return
        if (t.sync.health == SyncHealth.IN_SYNC &&
            t.sync.localRevision == t.sync.remoteRevision &&
            t.sync.presence == SyncPresence.ONLINE
        ) {
            return
        }

        val started = System.currentTimeMillis()
        t =
            t.copy(
                sync =
                    t.sync.copy(
                        health = SyncHealth.SYNCING,
                        syncStartedAtMs = started,
                        progress = 0.05f,
                        lastError = null,
                    ),
            )
        store.save(t)
        onUpdated()

        val online = onlineEnabled()
        val steps = 5
        val stepDelay = syncLatencyMs / steps
        for (i in 1..steps) {
            delay(stepDelay)
            val cur = store.load(ticketId) ?: return
            // Another local edit superseded this run.
            if (cur.sync.localRevision != t.sync.localRevision &&
                cur.sync.health != SyncHealth.REMOTE_AHEAD
            ) {
                return
            }
            val elapsed = System.currentTimeMillis() - started
            if (elapsed > errorAfterMs) {
                fail(ticketId, "Sync timed out — check connection and retry")
                return
            }
            store.save(
                cur.copy(
                    sync =
                        cur.sync.copy(
                            health = SyncHealth.SYNCING,
                            progress = i.toFloat() / steps,
                            syncStartedAtMs = started,
                        ),
                ),
            )
            onUpdated()
        }

        if (!online) {
            fail(ticketId, "Offline — ticket stays on this device until online sync is available")
            return
        }

        val cur = store.load(ticketId) ?: return
        val serverId = cur.sync.serverTicketId ?: "srv_${UUID.randomUUID().toString().take(8)}"
        val targetRev = maxOf(cur.sync.localRevision, cur.sync.remoteRevision)
        store.save(
            cur.copy(
                sync =
                    SyncState(
                        presence = SyncPresence.ONLINE,
                        health = SyncHealth.IN_SYNC,
                        localRevision = targetRev,
                        remoteRevision = targetRev,
                        serverTicketId = serverId,
                        syncStartedAtMs = null,
                        lastSyncedAtMs = System.currentTimeMillis(),
                        lastError = null,
                        progress = null,
                    ),
            ),
        )
        onUpdated()
    }

    private fun fail(ticketId: String, message: String) {
        val cur = store.load(ticketId) ?: return
        val health =
            when {
                cur.sync.localRevision > cur.sync.remoteRevision -> SyncHealth.ERROR
                cur.sync.remoteRevision > cur.sync.localRevision -> SyncHealth.ERROR
                cur.sync.presence == SyncPresence.LOCAL_ONLY -> SyncHealth.ERROR
                else -> SyncHealth.ERROR
            }
        store.save(
            cur.copy(
                sync =
                    cur.sync.copy(
                        health = health,
                        progress = null,
                        lastError = message,
                        syncStartedAtMs = cur.sync.syncStartedAtMs,
                    ),
            ),
        )
        onUpdated()
    }
}
