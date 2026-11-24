"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { OutboxQueue } from "@/components/OutboxQueue";
import { TICKET_TRAINING_NOTICE } from "@/lib/contact";
import { enqueueSubmission } from "@/lib/outbox";
import { getOrCreateVisitorId } from "@/lib/tickets/vault";

type Region = "georgia" | "israel";

type QueuedNotice = {
  title: string;
  mediaCount: number;
};

const MAX_MEDIA = 5;
const MEDIA_ACCEPT = "audio/*,video/*";

const EPHEMERAL_COPY =
  "Anonymous by default. Until sync, media stays only on this device. After upload, Intake may use Bunny temporary storage; batch SI processes and deletes media — only selected, reduced stills may remain.";

function Icon({ name }: { name: string }) {
  return (
    <svg className="submit-icon" width={24} height={24} aria-hidden="true">
      <use href={`/design/ui-kit/icons.svg#${name}`} />
    </svg>
  );
}

export function SubmitTicketForm() {
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState<Region>("georgia");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [wantPublic, setWantPublic] = useState(false);
  const [publicSlug, setPublicSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState<QueuedNotice | null>(null);

  const [recording, setRecording] = useState(false);
  const [reviewBlob, setReviewBlob] = useState<Blob | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [showRecorder, setShowRecorder] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    };
  }, [stopStream, reviewUrl]);

  useEffect(() => {
    if (videoPreviewRef.current && streamRef.current && recording) {
      videoPreviewRef.current.srcObject = streamRef.current;
    }
  }, [recording, camOn]);

  async function startRecording() {
    setError(null);
    if (mediaFiles.length >= MAX_MEDIA) {
      setError(`Up to ${MAX_MEDIA} audio or video files in total.`);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: micOn,
        video: camOn
          ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime =
        MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : MediaRecorder.isTypeSupported("video/webm")
            ? "video/webm"
            : MediaRecorder.isTypeSupported("audio/webm")
              ? "audio/webm"
              : "";
      const recorder = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || (camOn ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, { type });
        if (reviewUrl) URL.revokeObjectURL(reviewUrl);
        setReviewBlob(blob);
        setReviewUrl(URL.createObjectURL(blob));
        setRecording(false);
        stopStream();
      };
      recorder.start(1000);
      setRecording(true);
      setRecSeconds(0);
      setShowRecorder(true);
      timerRef.current = window.setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError("Could not access microphone or camera. Check browser permissions.");
      stopStream();
    }
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else {
      setRecording(false);
      stopStream();
    }
  }

  async function toggleMic() {
    const next = !micOn;
    setMicOn(next);
    const stream = streamRef.current;
    if (!stream || !recording) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    if (next && stream.getAudioTracks().length === 0) {
      try {
        const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
        audio.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch {
        setMicOn(false);
      }
    }
  }

  async function toggleCam() {
    const next = !camOn;
    setCamOn(next);
    const stream = streamRef.current;
    if (!stream || !recording) return;
    if (!next) {
      stream.getVideoTracks().forEach((t) => {
        t.stop();
        stream.removeTrack(t);
      });
      return;
    }
    try {
      const video = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      video.getVideoTracks().forEach((t) => stream.addTrack(t));
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
    } catch {
      setCamOn(false);
    }
  }

  function keepRecording() {
    if (!reviewBlob) return;
    if (mediaFiles.length >= MAX_MEDIA) {
      setError(`Up to ${MAX_MEDIA} audio or video files in total.`);
      return;
    }
    const ext = reviewBlob.type.includes("video") ? "webm" : "webm";
    const file = new File(
      [reviewBlob],
      `recording-${Date.now()}.${ext}`,
      { type: reviewBlob.type || "video/webm" },
    );
    setMediaFiles((prev) => [...prev, file].slice(0, MAX_MEDIA));
    discardReview();
    setShowRecorder(false);
  }

  function discardReview() {
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewBlob(null);
    setReviewUrl(null);
    setRecSeconds(0);
  }

  function onPickFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = [...mediaFiles];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("audio/") && !f.type.startsWith("video/")) continue;
      if (next.length >= MAX_MEDIA) break;
      next.push(f);
    }
    setMediaFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeMedia(i: number) {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const text = description.trim();
    if (!text && mediaFiles.length === 0) {
      setError("Describe the problem or add a recording / file.");
      return;
    }
    setBusy(true);
    try {
      const visitor = getOrCreateVisitorId();
      const sub = await enqueueSubmission({
        visitorId: visitor,
        region,
        description: text,
        files: mediaFiles,
        wantPublic,
        publicSlug,
      });
      setDescription("");
      setMediaFiles([]);
      setWantPublic(false);
      setPublicSlug("");
      setQueued({ title: sub.title, mediaCount: sub.media.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save on device");
    } finally {
      setBusy(false);
    }
  }

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (queued) {
    return (
      <div className="submit-success" role="status">
        <OutboxQueue />
        <h2 className="ticket-section-title">Saved on this device</h2>
        <p>
          <strong>{queued.title}</strong>
          {queued.mediaCount > 0
            ? ` · ${queued.mediaCount} media file${queued.mediaCount === 1 ? "" : "s"}`
            : ""}{" "}
          is queued. It uploads automatically when the network is available —
          keep submitting more batches offline if you need to.
        </p>
        <p className="signup-disclaimer">{TICKET_TRAINING_NOTICE}</p>
        <p className="cta-row">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setQueued(null)}
          >
            Submit another
          </button>
          <Link className="btn-secondary" href="/">
            Home
          </Link>
        </p>
      </div>
    );
  }

  if (reviewBlob && reviewUrl) {
    return (
      <div className="submit-form submit-record-review">
        <h2 className="hero-title" style={{ fontSize: "1.75rem" }}>
          Ready to send?
        </h2>
        <div className="submit-tile">
          <Icon name="record" />
          <div>
            <b>Recording · {fmtTime(recSeconds)}</b>
            <small>One clip</small>
          </div>
        </div>
        {reviewBlob.type.startsWith("video/") ? (
          <video
            className="submit-preview"
            src={reviewUrl}
            controls
            playsInline
          />
        ) : (
          <audio className="submit-preview-audio" src={reviewUrl} controls />
        )}
        <p className="muted">{EPHEMERAL_COPY}</p>
        <button type="button" className="btn-primary" onClick={keepRecording}>
          <Icon name="submit" /> Add to problem
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            discardReview();
            void startRecording();
          }}
        >
          <Icon name="record" /> Record again
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            discardReview();
            setShowRecorder(false);
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  if (showRecorder || recording) {
    return (
      <div className="submit-form submit-record">
        <h2 className="hero-title" style={{ fontSize: "1.75rem" }}>
          Record
        </h2>
        <div className="submit-preview-box">
          {recording ? (
            <div className="submit-recording-badge">
              <span className="submit-dot" /> Recording · {fmtTime(recSeconds)}
            </div>
          ) : null}
          {camOn ? (
            <video
              ref={videoPreviewRef}
              className="submit-preview"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <div className="submit-camera-off">
              <Icon name="camera-off" />
              <p>Camera off</p>
            </div>
          )}
        </div>
        <div className="submit-pair">
          <button type="button" className="btn-secondary" onClick={toggleMic}>
            <Icon name={micOn ? "mic-on" : "mic-off"} />
            {micOn ? "Mic on" : "Mic off"}
          </button>
          <button type="button" className="btn-secondary" onClick={toggleCam}>
            <Icon name={camOn ? "camera-on" : "camera-off"} />
            {camOn ? "Camera on" : "Camera off"}
          </button>
        </div>
        {recording ? (
          <button type="button" className="btn-primary" onClick={stopRecording}>
            <Icon name="stop" /> Stop recording
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={() => void startRecording()}
          >
            <Icon name="record" /> Start recording
          </button>
        )}
        <p className="muted">
          One continuous recording. You can change mic and camera anytime.
        </p>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (recording) stopRecording();
            discardReview();
            setShowRecorder(false);
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <form className="signup-form submit-form submit-max" onSubmit={onSubmit}>
      <OutboxQueue />
      <h1 className="submit-form-title">What&apos;s your problem?</h1>
      <label className="submit-desc-label">
        <span className="visually-hidden">Describe what happened</span>
        <textarea
          name="description"
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened…"
          className="submit-tall"
        />
      </label>

      <div className="submit-pair">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setShowRecorder(true);
            void startRecording();
          }}
        >
          <Icon name="record" /> Record
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="upload" /> Upload files
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        hidden
        onChange={(e) => onPickFiles(e.target.files)}
      />
      <p className="muted">Up to {MAX_MEDIA} audio or video files in total.</p>

      {mediaFiles.length > 0 ? (
        <ul className="submit-media-list">
          {mediaFiles.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span>
                {f.type.startsWith("video/") ? "Video" : "Audio"} · {f.name}
              </span>
              <button type="button" onClick={() => removeMedia(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <label>
        Region
        <select
          name="region"
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
        >
          <option value="georgia">Georgia (US)</option>
          <option value="israel">Israel</option>
        </select>
      </label>

      <fieldset className="submit-public">
        <legend>Public share</legend>
        <label className="submit-check">
          <input
            type="checkbox"
            checked={wantPublic}
            onChange={(e) => setWantPublic(e.target.checked)}
          />
          Create a public slug so others can open a short link and help
        </label>
        {wantPublic ? (
          <label>
            Preferred slug (optional)
            <input
              name="slug"
              value={publicSlug}
              onChange={(e) => setPublicSlug(e.target.value)}
              placeholder="e.g. garage-ring-power"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
          </label>
        ) : null}
      </fieldset>

      <p className="muted">{EPHEMERAL_COPY}</p>
      <p className="signup-disclaimer" role="note">
        {TICKET_TRAINING_NOTICE}
      </p>

      {error ? <p className="form-err">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={busy}>
        <Icon name="submit" />
        {busy ? "Submitting…" : "Submit problem"}
      </button>
    </form>
  );
}
