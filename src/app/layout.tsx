import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyProblem — Free AI front door for local businesses",
    template: "%s · MyProblem",
  },
  description:
    "Coming soon. Local businesses join at $0 forever. AI triage so unsure customers never clog the phone. Pilots in Georgia and Israel.",
  openGraph: {
    title: "MyProblem",
    description:
      "Free forever front door for local businesses. Problems, not chats. Zero-salary Relay vision.",
    url: SITE_URL,
    siteName: "MyProblem",
    type: "website",
  },
  alternates: { canonical: SITE_URL },
  authors: [{ name: "MyProblem", url: SITE_URL }],
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
