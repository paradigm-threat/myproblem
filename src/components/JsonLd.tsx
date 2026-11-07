import { CONTACT_EMAIL, SITE_URL } from "@/lib/contact";

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
        ],
        description:
          "AI investigation service for Problems — free forever for local businesses; deferred Projects; Georgia- and Israel-scoped shared knowledge base; free core help for people.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "MyProblem",
        description:
          "Free AI front door for local businesses. Deferred Projects and a place-tied knowledge base for Georgia and Israel pilots.",
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
          "Capture Problem tickets; deferred Projects for thorough investigation; shared local knowledge and place channels in Georgia and Israel; connect with local merchants.",
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
