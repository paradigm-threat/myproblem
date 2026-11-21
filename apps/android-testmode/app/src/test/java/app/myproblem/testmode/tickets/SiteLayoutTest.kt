package app.myproblem.testmode.tickets

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class SiteLayoutTest {
    @Test
    fun phoneWidth_isTheMobileLayout() {
        assertThat(SiteLayout.mode(412)).isEqualTo(SiteLayout.Mode.MOBILE)
        assertThat(SiteLayout.mode(899)).isEqualTo(SiteLayout.Mode.MOBILE)
    }

    @Test
    fun desktopWidth_matchesTheSiteBreakpoint() {
        assertThat(SiteLayout.DESKTOP_MIN_PX).isEqualTo(900)
        assertThat(SiteLayout.mode(900)).isEqualTo(SiteLayout.Mode.DESKTOP)
        assertThat(SiteLayout.mode(1280)).isEqualTo(SiteLayout.Mode.DESKTOP)
    }
}
