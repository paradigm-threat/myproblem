import Image from "next/image";
import Link from "next/link";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  RELAY_URL,
  SITE_URL,
  SI_FOOTER_GLOSS,
} from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="site footer" role="contentinfo">
      <div className="footer-brand">
        <Image
          src="/icons/icon-64.png"
          alt=""
          width={40}
          height={40}
          className="brand-mark"
        />
        <strong>MyProblem</strong>
      </div>
      <nav className="footer-nav" aria-label="Footer">
        <div className="footer-col">
          <p className="footer-col-label">Use</p>
          <OpenChatButton className="footer-chat-link">Public room</OpenChatButton>
          <Link href="/businesses">Businesses</Link>
          <span className="footer-muted">Private tickets (planned)</span>
        </div>
        <div className="footer-col">
          <p className="footer-col-label">Connect</p>
          <Link href="/extension">Extension</Link>
          <Link href="/investors">Funding</Link>
          <a href="https://clevertree.chat" rel="noopener noreferrer">
            CleverTree Chat
          </a>
        </div>
        <div className="footer-col">
          <p className="footer-col-label">Accountability</p>
          <Link href="/how-we-run">How we run</Link>
          <Link href="/rules">Posted rules</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/disclaimers">Disclaimers</Link>
        </div>
      </nav>
      <p className="footer-contact">
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        {" · "}
        <a
          href={BUSINESS_PDF_PATH}
          target="_blank"
          rel="noopener noreferrer"
        >
          Business PDF
        </a>
        {" · "}
        <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
          Relay
        </a>
        {" · "}
        <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
      </p>
      <p>
        <Link href="/#si-different">{SI_FOOTER_GLOSS}</Link> Operated by
        Clevertree LLC (Georgia). Pilots in Georgia and Israel. Public
        intelligence should be free.
      </p>
    </footer>
  );
}
