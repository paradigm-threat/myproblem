package app.myproblem.testmode.tickets

/**
 * Same split as the site in fixit-theme.css (`min-width: 900px`).
 * The window width picks the layout. A phone stays mobile. A wide tablet
 * uses the desktop arrangement.
 */
object SiteLayout {
    const val DESKTOP_MIN_PX = 900

    enum class Mode {
        MOBILE,
        DESKTOP,
    }

    fun mode(widthPx: Int): Mode =
        if (widthPx >= DESKTOP_MIN_PX) Mode.DESKTOP else Mode.MOBILE
}
