import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Lexend } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { TEXT_SIZE_SCRIPT } from "@/lib/text-size";
import "./globals.css";

// Body text: designed by the Braille Institute to stay readable for people with low vision.
const body = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  // Next.js has no size metrics for this newer family, so fall back to plain system fonts.
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});
// Headings: Lexend was designed to make reading easier.
const heading = Lexend({ subsets: ["latin"], variable: "--font-heading", display: "swap" });

export const metadata: Metadata = {
  title: { default: "AstroVerse · Your numbers, your stars, your hand", template: "%s · AstroVerse" },
  description:
    "Numerology, Vedic astrology and palmistry explained in plain words. Get three readings, see where they agree, and ask questions about your own results.",
};

export const viewport: Viewport = {
  themeColor: "#faf9f6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
