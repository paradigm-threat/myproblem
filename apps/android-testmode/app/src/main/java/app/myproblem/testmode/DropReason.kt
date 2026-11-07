package app.myproblem.testmode

enum class DropReason(val label: String) {
    NONE("—"),
    BLUR("blur"),
    MOTION("motion/shake"),
    DUPLICATE("duplicate"),
    WRONG_ANGLE("wrong angle"),
    WRONG_TARGET("wrong_target"),
    WRONG_TEXT("wrong_text"),
    SAME_TEXT("same_text"),
    GLARE("glare"),
    DARK("too dark"),
    BRIGHT("too bright"),
    FEED_OFF("feed off"),
    OCR_PENDING("ocr_pending"),
}

/**
 * Investigation outcomes for a frame:
 * - DROP — failed quality / uniqueness / active non-text hints
 * - KEEP — clear unique candidate; more capabilities (e.g. OCR) still running
 * - SEND — evidence fits current ask — would upload to server
 */
enum class Decision {
    DROP,
    KEEP,
    SEND,
}
