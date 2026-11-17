"use client";

import { useEffect, useState } from "react";

type Still = { id: string; uri: string; alt?: string };

export function FixitPhotoGallery({ stills }: { stills: Still[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = stills.find((s) => s.id === openId) || null;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (stills.length === 0) {
    return <p className="fixit-lead">No photos attached yet.</p>;
  }

  return (
    <>
      <ul className="fixit-gallery">
        {stills.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="thumb"
              onClick={() => setOpenId(s.id)}
              aria-label="Open photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.uri} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
      <p className="fixit-notice">Scrubbed stills only. Tap for lightbox.</p>
      {open ? (
        <div
          className="fixit-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          onClick={() => setOpenId(null)}
        >
          <button
            type="button"
            className="fixit-btn ghost fixit-lightbox-close"
            onClick={() => setOpenId(null)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open.uri}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
