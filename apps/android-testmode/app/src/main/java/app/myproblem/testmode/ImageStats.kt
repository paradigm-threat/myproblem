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
)
