import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/contact";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1a2e" },
    { media: "(prefers-color-scheme: light)", color: "#0b1a2e" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyProblem — Free AI front door for local businesses",
    template: "%s · MyProblem",
  },
  description:
    "Coming soon. Capture tickets, queue like JIRA, batch-investigate thoroughly — no on-demand frontier LLM. Bedrock only for rare escalate. Local KB for Georgia and Israel. Businesses free forever.",
  applicationName: "MyProblem",
  keywords: [
    "MyProblem",
    "AI problem solving",
    "deferred investigation",
    "Projects",
    "local knowledge base",
    "Georgia",
    "Israel",
    "local businesses",
    "free for businesses",
    "anonymous AI help",
    "Problem ticket",
  ],
  category: "technology",
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-167.png", sizes: "167x167", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "MyProblem — Free AI front door for local businesses",
    description:
      "Free forever for shops. Deferred Projects + Georgia/Israel local knowledge base. Problems, not chats. Zero-salary Relay vision.",
    url: SITE_URL,
    siteName: "MyProblem",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1024,
        height: 576,
        alt: "MyProblem — turn any problem into a solution",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyProblem — Free AI front door for local businesses",
    description:
      "Free forever for shops. Thorough Projects + local shared knowledge for GA and Israel.",
    images: ["/og.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "MyProblem",
    statusBarStyle: "black-translucent",
  },
  alternates: { canonical: SITE_URL },
  authors: [{ name: "MyProblem", url: SITE_URL }],
  creator: "MyProblem",
  publisher: "MyProblem",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "contact:email": CONTACT_EMAIL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
