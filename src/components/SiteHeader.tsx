"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

type NavItem = { href: string; label: string };

const HOME_LINKS: NavItem[] = [
  { href: "/#businesses", label: "For businesses" },
  { href: "/#people", label: "For people" },
  { href: "/#projects", label: "Projects" },
  { href: "/#knowledge", label: "Knowledge" },
  { href: "/#investors", label: "Investors" },
  { href: "/#regions", label: "Regions" },
  { href: "/how-we-run", label: "How we run" },
  { href: "/#signup", label: "Join" },
];

const DEMO_LINKS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/how-we-run", label: "How we run" },
  { href: "/#signup", label: "Join" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

type Props = {
  variant?: "home" | "demo";
};

export function SiteHeader({ variant = "home" }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const links = variant === "demo" ? DEMO_LINKS : HOME_LINKS;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${open ? " is-open" : ""}`}>
      <div className="site site-header-inner">
        <div className="nav">
          <Link
            className="brand"
            href="/"
            aria-label="MyProblem.app home"
            onClick={close}
          >
            <Image
              src="/icons/icon-64.png"
              alt=""
              width={36}
              height={36}
              className="brand-mark"
              priority
            />
            <span className="brand-text">MyProblem.app</span>
          </Link>

          <nav className="nav-links nav-links-desktop" aria-label="Page sections">
            {links.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle-bars" aria-hidden="true" />
          </button>
        </div>

        <nav
          id={panelId}
          className="nav-panel"
          aria-label="Mobile pages"
          hidden={!open}
        >
          <ul className="nav-panel-list">
            {links.map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} onClick={close}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
