import { CONTACT_EMAIL, RELAY_SOURCE_URL, RELAY_URL, SITE_URL } from "@/lib/contact";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "MyProblem",
        url: SITE_URL,
        email: CONTACT_EMAIL,
        logo: `${SITE_URL}/icons/icon-512.png`,
        sameAs: [
          "https://github.com/paradigm-threat/myproblem",
          "https://gitlab.com/clevertree/myproblem",
          RELAY_SOURCE_URL,
          RELAY_URL,
        ],
        description:
          "Investigation service for Problems. Free forever. You should never expect to enter a card. If the help was good, tip the person, the AI, or both. No salaries. Powered by Relay.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "MyProblem",
        description:
          "Free AI front door for local businesses. Deferred Projects and a problem-solving knowledge base for Georgia and Israel — not a search-ad mirror.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/how-we-run#webpage`,
        url: `${SITE_URL}/how-we-run`,
        name: "How we run",
        description:
          "No salaries and no subscription. Free forever. A card appears only when someone wants to tip the person, the AI, or both. Intent, not a contract.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: "MyProblem",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Android",
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          name: "Free forever",
          price: "0",
          priceCurrency: "USD",
          description:
            "The service is free. No card is required to post, to answer, or to keep using it. A tip is optional, after a good experience, for the person who helped, the AI that helped, or both.",
        },
        description:
          "While you talk and show the problem, one question stays on screen until the requirements are specific. Then a queued Project investigates it. Free forever. No card expected. No salaries.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
