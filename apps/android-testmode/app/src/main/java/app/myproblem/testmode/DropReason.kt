package app.myproblem.testmode

enum class DropReason(val label: String) {
    NONE("—"),
    BLUR("blur"),
    MOTION("motion/shake"),
    DUPLICATE("duplicate"),
    WRONG_ANGLE("wrong angle"),
    GLARE("glare"),
    DARK("too dark"),
    BRIGHT("too bright"),
    FEED_OFF("feed off"),
}

enum class Decision {
    WORTHY,
    DROP,
}
