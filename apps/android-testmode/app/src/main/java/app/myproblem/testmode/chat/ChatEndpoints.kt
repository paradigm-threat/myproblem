package app.myproblem.testmode.chat

/**
 * Channel-first endpoints — same bases as the web site ([src/lib/contact.ts],
 * [src/lib/chat/channels.ts]). Public ask = IRC/Clevertree room, not tip mint.
 */
object ChatEndpoints {
    const val SITE_URL = "https://myproblem.app"

    /** Intake hosts chat WS + `/api/chat*` proxies (same as NEXT_PUBLIC_CHAT_API_BASE default). */
    const val CHAT_API_BASE = "https://intake.myproblem.app"

    const val DEFAULT_CHANNEL_SLUG = "mp-general"
    const val DEFAULT_IRC_CHANNEL = "#mp-general"

    /** Web marketing CTA — homepage room anchor. */
    const val WEB_ROOM_HASH = "$SITE_URL/#room"

    /**
     * Focused channel page for the APK WebView (same room as `#room` / `#mp-general`).
     * Prefer this over the full homepage so speak/video land in the room immediately.
     */
    const val APK_ROOM_URL = "$SITE_URL/c/$DEFAULT_CHANNEL_SLUG"

    /** Site proxies — APK WebView uses these via the page; native clients may call them too. */
    const val CHAT_POST_PATH = "/api/chat/post"
    const val CHAT_MEDIA_UPLOAD_PATH = "/api/chat-media/upload"

    fun chatPostUrl(siteBase: String = SITE_URL): String = "${siteBase.trimEnd('/')}$CHAT_POST_PATH"

    fun chatMediaUploadUrl(siteBase: String = SITE_URL): String =
        "${siteBase.trimEnd('/')}$CHAT_MEDIA_UPLOAD_PATH"

    fun channelPath(slug: String = DEFAULT_CHANNEL_SLUG): String = "/c/${slug.trim().removePrefix("#")}"

    fun channelUrl(slug: String = DEFAULT_CHANNEL_SLUG, siteBase: String = SITE_URL): String =
        "${siteBase.trimEnd('/')}${channelPath(slug)}"
}
