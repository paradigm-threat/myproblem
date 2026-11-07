package app.myproblem.testmode

data class ImageStats(
    val brightness: Float,
    val contrast: Float,
    val blurScore: Float,
    val laplacianVar: Float,
    val complexity: Float,
    val glareScore: Float,
    val frameDiffEnergy: Float,
    val pHash: Long,
    val width: Int,
    val height: Int,
    /** Interleaved HSV samples (h,s,v)×N for L1 color hints; null if unavailable. */
    val hsvSamples: FloatArray? = null,
    val hsvSampleCount: Int = 0,
    /** Optional dominant blob aspect (w/h); null until contour path exists. */
    val blobAspect: Float? = null,
)
