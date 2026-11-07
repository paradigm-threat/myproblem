package app.myproblem.testmode

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class OnDevicePackLoaderTest {
    private val sampleManifest =
        """
        {
          "version": "1.0.0",
          "minApp": 1,
          "packDisabled": false,
          "thresholds": {
            "shakeDrop": 0.85,
            "blurDrop": 0.62,
            "colorMinFraction": 0.04,
            "yawTolDeg": 20
          },
          "models": [],
          "hfProvenance": [
            { "repo_id": "timm/mobilenetv3_small_100.lamb_in1k", "revision": "main", "role": "embedding_planned" }
          ],
          "coachDefaults": { "holdStill": "Hold still" },
          "signature": null
        }
        """.trimIndent()

    @Test
    fun parse_readsVersionAndThresholds() {
        val pack = OnDevicePackLoader.parse(sampleManifest, source = "test")
        assertThat(pack.version).isEqualTo("1.0.0")
        assertThat(pack.source).isEqualTo("test")
        assertThat(pack.thresholds.colorMinFraction).isWithin(0.001f).of(0.04f)
        assertThat(pack.hfProvenance).hasSize(1)
        assertThat(pack.hfProvenance[0].repoId).contains("mobilenetv3")
        assertThat(pack.coachDefaults["holdStill"]).isEqualTo("Hold still")
    }

    @Test
    fun signaturePlaceholder_nullAccepted() {
        assertThat(OnDevicePackLoader.verifySignaturePlaceholder(sampleManifest, null)).isTrue()
    }

    @Test
    fun signaturePlaceholder_shortRejected() {
        assertThat(OnDevicePackLoader.verifySignaturePlaceholder(sampleManifest, "abc")).isFalse()
    }

    @Test
    fun signaturePlaceholder_longAcceptedForNow() {
        assertThat(
            OnDevicePackLoader.verifySignaturePlaceholder(
                sampleManifest,
                "0123456789abcdef",
            ),
        ).isTrue()
    }
}
