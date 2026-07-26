import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { TrustBar } from "@/components/layout/TrustBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "REN Health | The Swedish Way of Better Health",
    template: "%s | REN Health",
  },
  description:
    "REN Health — Founded in Sweden. Evidence-based formulas, premium ingredients, and quiet Swedish precision for better daily health.",
  metadataBase: new URL("https://www.renhealth.se"),
  openGraph: {
    title: "REN Health | The Swedish Way of Better Health",
    description:
      "A premium Swedish health brand built on science, prevention, and quiet luxury.",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface font-sans text-ink">
        <AppProviders>
          <TrustBar />
          <Suspense fallback={<div className="h-[140px] border-b border-line bg-surface-card" />}>
            <Header />
          </Suspense>
          <main className="flex-1 bg-surface">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
