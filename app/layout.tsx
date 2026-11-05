import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { TEXT_SIZE_SCRIPT } from "@/lib/text-size";
import "./globals.css";

// Editorial serif for headings, a friendly highly legible sans for reading, and a mono for small labels.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const label = Geist_Mono({ subsets: ["latin"], variable: "--font-label", display: "swap" });

export const metadata: Metadata = {
  title: { default: "AstroVerse · Your numbers, your stars, your hand", template: "%s · AstroVerse" },
  description:
    "Numerology, Vedic astrology and palmistry explained in plain words. Get three readings, see where they agree, and ask questions about your own results.",
};

export const viewport: Viewport = {
  themeColor: "#f2f0eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable} ${label.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
