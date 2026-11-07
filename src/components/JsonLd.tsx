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
          "AI investigation service for Problems — free forever for local businesses; deferred Projects for thorough ticket research; free core help for people.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "MyProblem",
        description:
          "Free AI front door for local businesses. Capture fast; investigate thoroughly as deferred Projects. Pilots in Georgia and Israel.",
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
          "Capture Problem tickets in realtime; queue deferred Projects for thorough AI investigation; connect with local merchants in pilot regions.",
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
