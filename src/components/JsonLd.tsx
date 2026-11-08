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
          "AI investigation service for Problems — free forever for local businesses; deferred Projects; Georgia- and Israel knowledge base for problem-solving (speculative, user+AI only, no boosting); free core help for people. Powered by Relay.",
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
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: "MyProblem",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Android",
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description:
            "Local businesses join free forever. Core consumer help is free; usage fees after free tickets fund infrastructure only. Priority shortens Project queues without weakening free-tier thoroughness.",
        },
        description:
          "Capture Problem tickets; queue like JIRA; batch Projects investigate thoroughly; KB-first problem-solving (including nearly-free websites); major coming soon: batched coding/docs/media work (not realtime IDE chat); no boosting.",
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
