"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatChannel } from "@/lib/chat/channels";
import { formatChannelMediaPost } from "@/lib/chat/channelMedia";

type Mode = "pick" | "type" | "speak" | "video" | null;

type Props = {
  open: boolean;
  channel: ChatChannel;
  onClose: () => void;
  /** Focus the room composer after type path */
  onFocusComposer?: () => void;
};

export function SubmitProblemOverlay({
  open,
  channel,
  onClose,
  onFocusComposer,
}: Props) {
  const [mode, setMode] = useState<Mode>("pick");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMode("pick");
      setText("");
      setStatus(null);
      setBusy(false);
    } else {
      stopMedia();
    }
  }, [open]);

  const stopMedia = useCallback(() => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRecording(false);
  }, []);

  async function postToChannel(body: string) {
    setBusy(true);
    setStatus("Posting to public room…");
    try {
      const topic = channel.ircChannel.replace(/^#/, "");
      let visitor = "";
      try {
        visitor = localStorage.getItem("myproblem.visitor") ||
          localStorage.getItem("clevertree.visitor") ||
          "";
        if (!visitor && typeof crypto !== "undefined" && crypto.randomUUID) {
          visitor = crypto.randomUUID();
          localStorage.setItem("myproblem.visitor", visitor);
          localStorage.setItem("clevertree.visitor", visitor);
        }
      } catch {
        /* ignore */
      }
      const res = await fetch("/api/chat/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: channel.ircChannel,
          topic,
          body,
          visitor: visitor || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };
      if (!res.ok) throw new Error(data.error || `post_${res.status}`);
      setStatus("Posted publicly. Others in the room can see it.");
      setTimeout(() => {
        onClose();
        onFocusComposer?.();
      }, 900);
    } catch (e) {
      setStatus(
        e instanceof Error
          ? e.message
          : "Could not post — try typing in the room below.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadAndPost(file: Blob, filename: string, kind: string) {
    setBusy(true);
    setStatus("Uploading…");
    try {
      const fd = new FormData();
      fd.append("file", file, filename);
      fd.append("channel", channel.slug);
      fd.append("kind", kind);
      const up = await fetch("/api/chat-media/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await up.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };
      if (!up.ok || !data.url) {
        throw new Error(data.error || `upload_${up.status}`);
      }
      await postToChannel(
        formatChannelMediaPost({
          kind,
          url: data.url,
          channelIrc: channel.ircChannel,
        }),
      );
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "Upload failed — try again.",
      );
      setBusy(false);
    }
  }

  async function startCapture(video: boolean) {
    setStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: "user" } : false,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = video
        ? MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm"
        : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      mediaRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const name = video
          ? `problem-${Date.now()}.webm`
          : `voice-${Date.now()}.webm`;
        void uploadAndPost(blob, name, video ? "video" : "audio");
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      rec.start();
      setRecording(true);
      setStatus(
        video
          ? "Recording video… tap stop when done. This posts publicly."
          : "Recording… tap stop when done. This posts publicly.",
      );
    } catch {
      setStatus("Microphone/camera permission needed, or use Type instead.");
    }
  }

  function stopCapture() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  }

  if (!open) return null;

  return (
    <div
      className="submit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-overlay-title"
    >
      <div className="submit-overlay-card">
        <button
          type="button"
          className="submit-overlay-close"
          aria-label="Close"
          onClick={() => {
            stopMedia();
            onClose();
          }}
        >
          ×
        </button>
        <p className="submit-overlay-eyebrow">Public room · {channel.ircChannel}</p>
        <h2 id="submit-overlay-title">Submit your problem</h2>
        <p className="submit-overlay-lead">
          Everything you send goes to this <strong>public</strong> IRC channel.
          People and AI can see it. There is no private mode on this path.
        </p>

        {mode === "pick" ? (
          <div className="submit-overlay-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setMode("type");
                onFocusComposer?.();
              }}
            >
              Type your problem
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode("speak");
                void startCapture(false);
              }}
            >
              Speak / record audio
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode("video");
                void startCapture(true);
              }}
            >
              Record video
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileRef.current?.click()}
            >
              Attach a file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*,video/*,image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const kind = f.type.startsWith("video")
                  ? "video"
                  : f.type.startsWith("audio")
                    ? "audio"
                    : "file";
                void uploadAndPost(f, f.name, kind);
              }}
            />
          </div>
        ) : null}

        {mode === "type" ? (
          <div className="submit-overlay-type">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Describe the problem…"
              aria-label="Problem text"
            />
            <div className="submit-overlay-actions row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setMode("pick")}
                disabled={busy}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={busy || !text.trim()}
                onClick={() => void postToChannel(text.trim())}
              >
                Post publicly
              </button>
            </div>
          </div>
        ) : null}

        {(mode === "speak" || mode === "video") && recording ? (
          <div className="submit-overlay-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={stopCapture}
              disabled={busy}
            >
              Stop &amp; post publicly
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                stopMedia();
                setMode("pick");
                setStatus(null);
              }}
            >
              Cancel
            </button>
          </div>
        ) : null}

        {status ? <p className="submit-overlay-status">{status}</p> : null}
      </div>
    </div>
  );
}
