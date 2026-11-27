import {
  CONTACT_EMAIL,
  RELAY_SOURCE_URL,
  RELAY_URL,
  SITE_URL,
  SI_FULL,
} from "@/lib/contact";

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
        description: `Investigation service for Problems. Public chat and AI stay free. Private chat is the paid lane. Seeking donations for an educational public utility. Powered by Relay.`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "MyProblem",
        description: `Public ${SI_FULL} front door. Ask in #mp-general. Deferred Projects and a problem-solving knowledge base for Georgia and Israel.`,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "MyProblem — Public help, free",
        description: `Ask in #mp-general. Public chat and AI stay free. Private chat is the paid lane. Pilots in Georgia and Israel.`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: `${SITE_URL}/og.jpg`,
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/how-we-run#webpage`,
        url: `${SITE_URL}/how-we-run`,
        name: "How we run",
        description:
          "Public chat and AI stay free. Private chat is the paid lane. Seeking tax-deductible donations for an educational public utility. Intent, not a contract.",
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
          name: "Free forever (public)",
          price: "0",
          priceCurrency: "USD",
          description:
            "Public rooms and channel AI are free. No card is required to ask in #mp-general. Private chat is the planned paid lane.",
        },
        description:
          "Header Clevertree Chat opens #mp-general (fullscreen or extension). Submit via type, speak, or video into IRC. Free forever for public help.",
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
