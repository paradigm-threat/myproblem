import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PublicChatShell } from "@/components/chat/PublicChatShell";
import { demoChannelList, resolveChannel } from "@/lib/chat/channels";
import { CONTACT_EMAIL, OG_IMAGE, SITE_URL } from "@/lib/contact";

type Props = {
  params: Promise<{ channel: string }>;
  searchParams: Promise<{ submit?: string }>;
};

export function generateStaticParams() {
  return demoChannelList().map((ch) => ({ channel: ch.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channel: raw } = await params;
  const ch = resolveChannel(raw);
  return {
    title: `${ch.title} · public room`,
    description: `Public help room ${ch.ircChannel}. Ask in the open — AI and people can help. Free forever.`,
    alternates: { canonical: `${SITE_URL}${ch.path}` },
    openGraph: {
      title: `${ch.title} · MyProblem`,
      description: `Public IRC room ${ch.ircChannel}. No private mode on this path.`,
      url: `${SITE_URL}${ch.path}`,
      images: [OG_IMAGE],
    },
  };
}

async function ChannelRoomMain({ params, searchParams }: Props) {
  const { channel: raw } = await params;
  const sp = await searchParams;
  const ch = resolveChannel(raw);
  const openSubmit = sp.submit === "1" || sp.submit === "true";

  return (
    <>
      <div className="site channel-page-intro">
        <p className="eyebrow">Public utility · IRC</p>
        <h1
          className="hero-title"
          style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)" }}
        >
          {ch.title}
        </h1>
        <p className="section-lead" style={{ marginBottom: "1rem" }}>
          Ask in the public room. History is visible. AI and people help
          in-channel. Public chat + AI stay free forever —{" "}
          <a href="/how-we-run">how we run</a>.
        </p>
      </div>
      <div className="site">
        <PublicChatShell channel={ch} openSubmit={openSubmit} />
      </div>
      <p className="site ticket-footer-note" style={{ marginTop: "1.5rem" }}>
        Contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        {" · "}
        <a href="/">Home</a>
      </p>
    </>
  );
}

export default function ChannelRoomPage(props: Props) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="channel-page">
        <Suspense
          fallback={
            <p className="site section-lead" style={{ padding: "1.25rem 0" }}>
              Loading public room…
            </p>
          }
        >
          <ChannelRoomMain {...props} />
        </Suspense>
      </main>
    </>
  );
}
