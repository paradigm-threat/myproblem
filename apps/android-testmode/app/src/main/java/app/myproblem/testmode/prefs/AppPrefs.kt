package app.myproblem.testmode.prefs

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import app.myproblem.testmode.tickets.StartMode
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore("myproblem_prefs")

class AppPrefs(private val context: Context) {
    private val onboardedKey = booleanPreferencesKey("onboarded")
    private val startModeKey = stringPreferencesKey("start_mode")
    private val showArchivedKey = booleanPreferencesKey("show_archived")
    private val onlineSyncKey = booleanPreferencesKey("online_sync_enabled")
    private val networkerKey = booleanPreferencesKey("networker_enabled")

    val onboarded: Flow<Boolean> =
        context.dataStore.data.map { it[onboardedKey] ?: false }

    val startMode: Flow<StartMode> =
        context.dataStore.data.map {
            runCatching { StartMode.valueOf(it[startModeKey] ?: StartMode.VIDEO_MESSAGE.name) }
                .getOrDefault(StartMode.VIDEO_MESSAGE)
        }

    val showArchived: Flow<Boolean> =
        context.dataStore.data.map { it[showArchivedKey] ?: false }

    /** Simulated online until ticket APIs land — off keeps tickets local-only (sync errors). */
    val onlineSyncEnabled: Flow<Boolean> =
        context.dataStore.data.map { it[onlineSyncKey] ?: true }

    /** Opt-in Networker home — keep tips moving (evidence/actions). Social gather is browser-only. */
    val networkerEnabled: Flow<Boolean> =
        context.dataStore.data.map { it[networkerKey] ?: false }

    suspend fun completeOnboarding(mode: StartMode, networkerEnabled: Boolean = false) {
        context.dataStore.edit {
            it[onboardedKey] = true
            it[startModeKey] = mode.name
            it[networkerKey] = networkerEnabled
        }
    }

    suspend fun setNetworkerEnabled(enabled: Boolean) {
        context.dataStore.edit { it[networkerKey] = enabled }
    }

    suspend fun setStartMode(mode: StartMode) {
        context.dataStore.edit { it[startModeKey] = mode.name }
    }

    suspend fun setShowArchived(show: Boolean) {
        context.dataStore.edit { it[showArchivedKey] = show }
    }

    suspend fun setOnlineSyncEnabled(enabled: Boolean) {
        context.dataStore.edit { it[onlineSyncKey] = enabled }
    }
}
