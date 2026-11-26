package app.myproblem.testmode.chat

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ChatEndpointsTest {
    @Test
    fun apkRoom_matchesWebDefaultChannel() {
        assertThat(ChatEndpoints.DEFAULT_CHANNEL_SLUG).isEqualTo("mp-general")
        assertThat(ChatEndpoints.DEFAULT_IRC_CHANNEL).isEqualTo("#mp-general")
        assertThat(ChatEndpoints.APK_ROOM_URL).isEqualTo("https://myproblem.app/c/mp-general")
        assertThat(ChatEndpoints.WEB_ROOM_HASH).isEqualTo("https://myproblem.app/#room")
    }

    @Test
    fun chatProxies_matchSitePaths() {
        assertThat(ChatEndpoints.CHAT_API_BASE).isEqualTo("https://intake.myproblem.app")
        assertThat(ChatEndpoints.chatPostUrl()).isEqualTo("https://myproblem.app/api/chat/post")
        assertThat(ChatEndpoints.chatMediaUploadUrl())
            .isEqualTo("https://myproblem.app/api/chat-media/upload")
    }

    @Test
    fun channelUrl_stripsHashAndUsesSite() {
        assertThat(ChatEndpoints.channelUrl("#ga-savannah-cat-rescue"))
            .isEqualTo("https://myproblem.app/c/ga-savannah-cat-rescue")
    }
}
