package app.myproblem.testmode.tickets

/**
 * On-device copy of the intake safety restraint. A hazard never gets ordinary
 * "first steps" advice. MyProblem does not verify the work is safe.
 * Keep the cases aligned with workers/lib/safetyRestraint.mjs.
 */
object SafetyGuard {
    data class Hazard(
        val id: String,
        val warning: String,
        val questions: List<String>,
    )

    fun classify(text: String): Hazard? {
        val blob = text.lowercase()
        val id =
            when {
                containsAny(blob, "suicid", "kill myself", "hurt myself", "don't want to live", "do not want to live") -> "crisis"
                containsAny(blob, "hot car", "locked in the car", "locked in a car") -> "hot_car"
                containsAny(blob, "chest pain", "can't breathe", "cannot breathe", "not breathing", "unconscious", "overdose", "severe bleeding") -> "medical"
                containsAny(blob, "in flames", "on fire", "smoke filling") -> "fire"
                containsAny(blob, "smell gas", "gas leak", "carbon monoxide", "co alarm") -> "gas"
                containsAny(blob, "bleach and ammonia", "chemical burn") -> "chemical"
                blob.contains("breaker") && containsAny(blob, "water", "flood", "wet") -> "water_electric"
                containsAny(
                    blob,
                    "electric wiring",
                    "electrical wiring",
                    "rewire",
                    "electrician",
                    "breaker box",
                    "electrical panel",
                    "live wire",
                    "garage wiring",
                    "wiring in my garage",
                ) -> "electrical"
                containsAny(blob, "ceiling is collapsing", "ceiling collapsing", "wall is bowing") -> "structural"
                containsAny(blob, "on the roof", "up a ladder", "on a ladder") -> "heights"
                else -> return null
            }
        return Hazard(id, warning(id), questions(id))
    }

    fun warning(id: String): String =
        when (id) {
            "crisis" -> "Safety warning — crisis. If you may hurt yourself or someone else, call emergency services now. In the US and Canada call or text 988. MyProblem does not verify crisis advice."
            "hot_car" -> "Safety warning — hot car. If a person or animal is trapped, call emergency services now. MyProblem does not verify rescue steps."
            "medical" -> "Safety warning — medical. MyProblem is not emergency care and does not verify symptoms or treatment. If this may be life-threatening, call emergency services now."
            "fire" -> "Safety warning — fire. Leave and call emergency services. MyProblem does not verify that the building is safe to enter."
            "gas" -> "Safety warning — gas. Leave the area and call your utility or emergency services from outside. MyProblem does not verify that the air is safe."
            "chemical" -> "Safety warning — chemicals. Get to fresh air. MyProblem does not verify that a mixture is safe."
            "water_electric" -> "Safety warning — water and electricity. Stay out. MyProblem does not verify this is safe."
            "structural" -> "Safety warning — structure. Leave if something is falling. MyProblem does not verify the building is safe."
            "heights" -> "Safety warning — fall. MyProblem does not verify the roof or ladder is safe. A fall can kill."
            else -> "Safety warning — electrical. MyProblem does not verify this is safe. Do not work on live wiring. If you see sparks, smell burning, or someone was shocked, leave and call emergency services. Hire a licensed electrician."
        }

    fun questions(id: String): List<String> =
        when (id) {
            "electrical" -> listOf(
                "Is anyone hurt, or do you see sparks or smell burning?",
                "Do you need a licensed electrician instead of doing this yourself?",
            )
            "medical", "fire", "gas", "hot_car", "crisis" -> listOf("Have you called emergency services?")
            else -> listOf("Can you get to a safe place before doing anything else?")
        }

    private fun containsAny(blob: String, vararg needles: String) = needles.any { blob.contains(it) }
}
