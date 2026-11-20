/**
 * Light client heuristics: gate + topics + value_rank per post (ticket unit).
 * Vocabulary aligned with savannah-cat-rescue collection / #ga-savannah-cat-rescue.
 */
(function (global) {
  "use strict";

  const RULES = [
    {
      key: "cat-health",
      rank: 0.89,
      re: /\b(cat health|kitten health|wellness|vaccine|rabies|FIV|FeLV|URI|upper respiratory|deworm|parasite|dental|nutrition)\b/i,
    },
    {
      key: "fundraiser",
      rank: 0.72,
      re: /\b(fundrais|raffle|bingo|gagives)\b/i,
    },
    {
      key: "lost",
      rank: 0.92,
      re: /\b(missing|went missing|still haven'?t found|reward for|lost (my|our)|my (cat|kitten|boy|girl).{0,40}(missing|lost))\b/i,
    },
    {
      key: "found",
      rank: 0.9,
      re: /\b(found (a |this )?(cat|kitten)|is this your (cat|kitten))\b/i,
    },
    {
      key: "sighting",
      rank: 0.88,
      re: /\b(has been seen|spotted|anyone seen|have you seen|sighting)\b/i,
    },
    {
      key: "medical",
      rank: 0.9,
      re: /\b(vet|injured|limping|broken leg|sick|urgent|fleas|ear mites|underweight|hit by|wound|mobile veterinarian)\b/i,
    },
    {
      key: "tnr",
      rank: 0.88,
      re: /\b(tnr|tnring|trap[\s/-]?neuter|ear[\s-]?tip|neutered|spay|need(s)? to be caught and fixed)\b/i,
    },
    {
      key: "relocate",
      rank: 0.91,
      re: /\b(relocat|no longer safe|poison|moving overseas|fend for themselves)\b/i,
    },
    {
      key: "feeding",
      rank: 0.8,
      re: /\b(feeder for|feeding a|local feeder|feed\/water)\b/i,
    },
    {
      key: "rehome",
      rank: 0.85,
      re: /\b(rehome|adopt|looking for a (home|kitten)|need(s)? a home|dm if interested|forever home|kittens if anyone)\b/i,
    },
    {
      key: "foster",
      rank: 0.8,
      re: /\b(foster|bottle feed|temporary home)\b/i,
    },
    {
      key: "supplies",
      rank: 0.75,
      re: /\b(wet food|cat food|litter|amazon list|supplies|donation|donate)\b/i,
    },
    {
      key: "volunteer",
      rank: 0.78,
      re: /\b(volunteer|help needed|looking for another|15 mins daily)\b/i,
    },
    {
      key: "colony-care",
      rank: 0.82,
      re: /\b(colony|feral|community cat|stray cats?)\b/i,
    },
    {
      key: "promo",
      rank: 0.05,
      outlier: true,
      re: /\b(pet care business|dog walking|cleaning services|free estimate|happy pet|petsitter)\b/i,
    },
    {
      key: "memorial",
      rank: 0.1,
      outlier: true,
      re: /\b(left me yesterday|saying goodbye|at peace|euthan|passed|memorial)\b/i,
    },
    {
      key: "off-topic",
      rank: 0.05,
      outlier: true,
      re: /\b(cleaner in my house|house cleaned|house cleaning|pitty|pit bull)\b/i,
    },
  ];

  /** Map legacy topic keys onto the refined vocabulary. */
  const LEGACY_TOPIC_MAP = {
    "lost-found": "lost",
    "vet-path": "medical",
    "useful-info": "colony-care",
  };

  function outlierReasonFromKey(key) {
    if (key === "promo-skip" || key === "promo") return "promo";
    if (key === "memorial-skip" || key === "memorial") return "memorial";
    if (key === "off-topic") return "off-topic";
    if (key && key.endsWith("-skip")) return key.replace(/-skip$/, "");
    return key || "off-topic";
  }

  function mapTopic(key) {
    return LEGACY_TOPIC_MAP[key] || key;
  }

  function classify(text) {
    const body = text || "";
    const hits = [];
    let bestOutlier = null;
    for (const rule of RULES) {
      if (!rule.re.test(body)) continue;
      const isOutlier =
        rule.outlier ||
        rule.key.endsWith("-skip") ||
        rule.key === "off-topic";
      if (isOutlier) {
        if (!bestOutlier || rule.rank < bestOutlier.rank) bestOutlier = rule;
        continue;
      }
      hits.push(rule);
    }
    if (bestOutlier && hits.length === 0) {
      const reason = outlierReasonFromKey(bestOutlier.key);
      return {
        gate: "outlier",
        skip: true,
        outlier_reason: reason,
        suggested_topics: [],
        value_rank: bestOutlier.rank,
      };
    }
    if (hits.length === 0) {
      return {
        gate: "ticket",
        skip: false,
        outlier_reason: null,
        suggested_topics: ["colony-care"],
        value_rank: 0.4,
      };
    }
    hits.sort((a, b) => b.rank - a.rank);
    const topics = [...new Set(hits.map((h) => mapTopic(h.key)))];
    const value_rank = Math.min(
      1,
      hits[0].rank + Math.min(0.1, hits.length * 0.02)
    );
    return {
      gate: "ticket",
      skip: false,
      outlier_reason: null,
      suggested_topics: topics,
      value_rank,
    };
  }

  /** Normalize legacy v0 thread fields onto v1 gate shape. */
  function normalizeThread(t) {
    if (!t || typeof t !== "object") return t;
    const next = { ...t };
    if (!next.gate) {
      if (next.skip) {
        next.gate = "outlier";
        const topic0 = (next.suggested_topics || [])[0];
        next.outlier_reason = outlierReasonFromKey(topic0 || "off-topic");
        next.suggested_topics = [];
        next.reply_templates = [];
      } else {
        next.gate = "ticket";
        next.skip = false;
      }
    }
    if (next.gate === "outlier") {
      next.skip = true;
      next.suggested_topics = [];
      next.reply_templates = [];
      if (!next.outlier_reason) next.outlier_reason = "off-topic";
    } else {
      next.gate = "ticket";
      next.skip = false;
      next.outlier_reason = null;
      if (Array.isArray(next.suggested_topics)) {
        next.suggested_topics = [
          ...new Set(next.suggested_topics.map(mapTopic)),
        ];
      }
    }
    return next;
  }

  global.MyProblemTopics = {
    classify,
    normalizeThread,
    RULES,
    outlierReasonFromKey,
    mapTopic,
    LEGACY_TOPIC_MAP,
  };
})(typeof globalThis !== "undefined" ? globalThis : self);
