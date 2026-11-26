"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { demoChannelList, type ChatChannel } from "@/lib/chat/channels";

type Props = {
  current: ChatChannel;
};

/**
 * Channel switcher — not visible by default (too confusing for newcomers).
 * Open via the discreet "Rooms" control in the corner.
 */
export function HiddenChannelMenu({ current }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rooms = demoChannelList();

  return (
    <div className="channel-menu" ref={panelRef}>
      <button
        type="button"
        className="channel-menu-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Rooms (hidden menu)"
        title="Rooms"
        onClick={() => setOpen((v) => !v)}
      >
        ···
      </button>
      {open ? (
        <div className="channel-menu-panel" role="menu">
          <p className="channel-menu-label">Public rooms</p>
          {rooms.map((ch) => (
            <Link
              key={ch.slug}
              href={ch.path}
              role="menuitem"
              className={
                ch.slug === current.slug
                  ? "channel-menu-item is-current"
                  : "channel-menu-item"
              }
              onClick={() => setOpen(false)}
            >
              <span>{ch.title}</span>
              <code>{ch.ircChannel}</code>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
