"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  averageHash,
  decideGate,
  GATE,
  hammingDistance,
  sectorFromYaw,
  type DropReason,
  type GateDecision,
} from "@/lib/frameGate";
import { CONTACT_EMAIL } from "@/lib/contact";

type Hud = {
  decision: GateDecision | "—";
  dropReason: DropReason | "—";
  isMoving: boolean;
  isShaking: boolean;
  brightness: number;
  blurScore: number;
  complexity: number;
  sectorId: number;
  worthy: number;
  drops: number;
  filled: number[];
  tickMs: number;
  json: string;
};

const emptyHud: Hud = {
  decision: "—",
  dropReason: "—",
  isMoving: false,
  isShaking: false,
  brightness: 0,
  blurScore: 0,
  complexity: 0,
  sectorId: 0,
  worthy: 0,
  drops: 0,
  filled: [],
  tickMs: 0,
  json: "{}",
};

const outlineBtn: React.CSSProperties = {
  background: "transparent",
  color: "#e6b35c",
  border: "1px solid rgba(232,242,236,0.2)",
  borderRadius: 999,
  padding: "10px 14px",
  cursor: "pointer",
};

export function TestModeClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hashesRef = useRef<bigint[]>([]);
  const filledRef = useRef<Set<number>>(new Set());
  const lastGrayRef = useRef<Uint8Array | null>(null);
  const worthyRef = useRef(0);
  const dropsRef = useRef(0);
  const yawRef = useRef(0);
  const shakeRef = useRef(0);
  const scenarioRef = useRef(true);
  const runningRef = useRef(false);

  const [feedOn, setFeedOn] = useState(false);
  const [scenarioOn, setScenarioOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hud, setHud] = useState<Hud>(emptyHud);

  useEffect(() => {
    scenarioRef.current = scenarioOn;
  }, [scenarioOn]);

  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (typeof e.alpha === "number") yawRef.current = e.alpha;
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopFeed = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setFeedOn(false);
  }, [stopLoop]);

  const resetSession = () => {
    hashesRef.current = [];
    filledRef.current = new Set();
    lastGrayRef.current = null;
    worthyRef.current = 0;
    dropsRef.current = 0;
    setHud(emptyHud);
  };

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      timerRef.current = setTimeout(tick, 120);
      return;
    }

    const t0 = performance.now();
    const cols = 64;
    const rows = 48;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      timerRef.current = setTimeout(tick, 120);
      return;
    }
    ctx.drawImage(video, 0, 0, cols, rows);
    const { data } = ctx.getImageData(0, 0, cols, rows);
    const gray = new Uint8Array(cols * rows);
    let sum = 0;
    let glare = 0;
    for (let i = 0, g = 0; i < data.length; i += 4, g++) {
      const v = Math.round(
        0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!,
      );
      gray[g] = v;
      sum += v;
      if (v >= 245) glare++;
    }
    const brightness = sum / (gray.length * 255);
    const glareScore = glare / gray.length;

    let lapSum = 0;
    let lapSq = 0;
    let n = 0;
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const i = r * cols + c;
        const lap =
          gray[i - cols]! +
          gray[i + cols]! +
          gray[i - 1]! +
          gray[i + 1]! -
          4 * gray[i]!;
        lapSum += lap;
        lapSq += lap * lap;
        n++;
      }
    }
    const mean = n ? lapSum / n : 0;
    const lapVar = n ? lapSq / n - mean * mean : 0;
    const blurScore = 1 - lapVar / (lapVar + 80);
    const complexity = lapVar / (lapVar + 40);

    let frameDiff = 0;
    const prev = lastGrayRef.current;
    if (prev && prev.length === gray.length) {
      let d = 0;
      for (let i = 0; i < gray.length; i++) d += Math.abs(gray[i]! - prev[i]!);
      frameDiff = d / (gray.length * 255);
    }
    lastGrayRef.current = gray;

    const hash = averageHash(gray, cols, rows);
    let uniqueDistance = 64;
    for (const h of hashesRef.current) {
      uniqueDistance = Math.min(uniqueDistance, hammingDistance(hash, h));
    }

    const shakeScore = Math.min(1.5, frameDiff * 8);
    shakeRef.current = 0.7 * shakeRef.current + 0.3 * shakeScore;

    const sectorId = sectorFromYaw(yawRef.current);
    const result = decideGate({
      feedOn: true,
      brightness,
      blurScore,
      glareScore,
      shakeScore: shakeRef.current,
      frameDiffEnergy: frameDiff,
      uniqueDistance,
      sectorId,
      sectorsFilled: [...filledRef.current],
      scenarioActive: scenarioRef.current,
    });

    if (result.decision === "WORTHY") {
      worthyRef.current += 1;
      hashesRef.current.push(hash);
      if (hashesRef.current.length > 24) hashesRef.current.shift();
      if (scenarioRef.current) filledRef.current.add(sectorId);
    } else {
      dropsRef.current += 1;
    }

    const tickMs = Math.round(performance.now() - t0);
    const packet = {
      decision: result.decision,
      dropReason: result.dropReason,
      motion: {
        isMoving: result.isMoving,
        isShaking: result.isShaking,
        shakeScore: shakeRef.current,
        frameDiffEnergy: frameDiff,
      },
      image: { brightness, blurScore, complexity, glareScore },
      attitude: { yawDeg: yawRef.current, sectorId },
      scenario: { filled: [...filledRef.current] },
      uniqueness: { uniqueDistance },
      tickMs,
    };

    setHud({
      decision: result.decision,
      dropReason: result.dropReason,
      isMoving: result.isMoving,
      isShaking: result.isShaking,
      brightness,
      blurScore,
      complexity,
      sectorId,
      worthy: worthyRef.current,
      drops: dropsRef.current,
      filled: [...filledRef.current],
      tickMs,
      json: JSON.stringify(packet),
    });

    timerRef.current = setTimeout(tick, 120);
  }, []);

  const startFeed = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setFeedOn(true);
      runningRef.current = true;
      timerRef.current = setTimeout(tick, 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera permission denied");
      setFeedOn(false);
    }
  };

  useEffect(() => () => stopFeed(), [stopFeed]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1410",
        color: "#e8f2ec",
        fontFamily: "system-ui, sans-serif",
        padding: "1rem",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#5fd4a4", fontSize: "1.35rem", margin: 0 }}>
        MyProblem · Test Mode (web)
      </h1>
      <p style={{ color: "#9bb5a6", fontSize: 13 }}>
        Offline browser gate — nothing uploads. Android parity path.{" "}
        <a href="/" style={{ color: "#5fd4a4" }}>
          Home
        </a>
      </p>

      <div style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => (feedOn ? stopFeed() : void startFeed())}
          style={{
            background: feedOn ? "#ff8f8f" : "#5fd4a4",
            color: feedOn ? "#111" : "#062016",
            border: "none",
            borderRadius: 999,
            padding: "10px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {feedOn ? "Stop feed" : "Start feed"}
        </button>
        <button
          type="button"
          onClick={() => setScenarioOn((v) => !v)}
          style={outlineBtn}
        >
          Angles: {scenarioOn ? "ON" : "OFF"}
        </button>
        <button type="button" onClick={resetSession} style={outlineBtn}>
          Reset
        </button>
      </div>

      <div
        style={{
          position: "relative",
          background: "#122019",
          borderRadius: 12,
          overflow: "hidden",
          aspectRatio: "3/4",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: feedOn ? "block" : "none",
          }}
        />
        {!feedOn ? (
          <p style={{ padding: 24, color: "#9bb5a6", textAlign: "center" }}>
            Feed OFF — tap Start feed (normal click, not a shake gesture)
          </p>
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "rgba(11,20,16,0.8)",
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 12,
          }}
        >
          {feedOn ? "Analysis ON (on-device)" : "Analysis OFF"}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <pre
        style={{
          marginTop: 12,
          background: "#122019",
          borderRadius: 12,
          padding: 12,
          fontSize: 12,
          whiteSpace: "pre-wrap",
          color: "#9bb5a6",
        }}
      >
        {feedOn
          ? hud.decision === "WORTHY"
            ? "WORTHY — would upload this frame"
            : hud.dropReason === "duplicate"
              ? "DROP · duplicate — feed working; move/new angle for another worthy"
              : hud.dropReason === "motion/shake"
                ? "DROP · shake/motion — hold still"
                : `Decision: ${hud.decision} · ${hud.dropReason}`
          : "Feed OFF"}
        {"\n"}
        moving={String(hud.isMoving)} shaking={String(hud.isShaking)} sector=
        {hud.sectorId} light={hud.brightness.toFixed(2)} blur=
        {hud.blurScore.toFixed(2)} cx={hud.complexity.toFixed(2)}
        {"\n"}
        worthy={hud.worthy} drops={hud.drops} filled={hud.filled.length}/
        {GATE.SECTOR_COUNT} tick={hud.tickMs}ms
        {"\n\n"}
        {hud.json}
      </pre>

      {error ? <p style={{ color: "#ff8f8f" }}>{error}</p> : null}
      <p style={{ color: "#6a7a72", fontSize: 12 }}>
        Contact {CONTACT_EMAIL}. iOS later. Shared gate logic lives in{" "}
        <code>src/lib/frameGate.ts</code> (mirrors Android ContextBuilder).
      </p>
    </main>
  );
}
