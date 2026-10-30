import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = { title: "About · AstroVerse", description: "What AstroVerse is, how each reading is calculated, and the sources behind it." };

export default function AboutPage() {
  return (
    <InfoPage eyebrow="About" title="Three traditions, one transparent reading"
      intro="AstroVerse reads you through Vedic numerology, Vedic astrology and palmistry, then compares what the three systems say. Every prediction links back to the calculation and the source text it came from, so you can always see why it was made.">
      <InfoSection title="What AstroVerse does">
        <ul>
          <li><strong>Numerology</strong> calculates your Moolank, Bhagyank, Namank and Personal Year.</li>
          <li><strong>Vedic astrology</strong> casts your sidereal birth chart, with dignities, yogas, Vimshottari dashas and current transits.</li>
          <li><strong>Palmistry</strong> detects your hand in a photo, traces the principal lines, locates the mounts and measures the hand shape.</li>
          <li>The <strong>Guide</strong> and the <strong>Combined Report</strong> line up the claims from all three readings by theme and show how much each system contributed to an answer.</li>
        </ul>
      </InfoSection>

      <InfoSection id="research" title="Research and sources">
        <ul>
          <li><strong>Numerology:</strong> the Chaldean letter table and reduction rules, with interpretations drawn from the research team&apos;s Numerology Guide.</li>
          <li><strong>Astrology:</strong> planetary positions from the Swiss Ephemeris in the Lahiri sidereal zodiac, with whole-sign houses and mean lunar nodes, read through classical Parashari rules.</li>
          <li><strong>Palmistry:</strong> hand landmarks from Google MediaPipe, crease tracing with ridge filters, and interpretations quoted from Cheiro&apos;s <em>Palmistry for All</em> (public domain, Project Gutenberg #20480).</li>
          <li><strong>Writing:</strong> a large language model turns the selected evidence into readable text. It may only cite claims supplied to it, and uncited statements are removed.</li>
        </ul>
      </InfoSection>

      <InfoSection title="What it is not">
        <p>Numerology, astrology and palmistry are traditional practices, not scientifically validated methods. AstroVerse presents what these traditions say, as reflection and entertainment. It is not medical, legal, financial or psychological advice, and nothing in it predicts health outcomes or lifespan.</p>
      </InfoSection>

      <InfoSection title="Your data">
        <p>Palm photos are analysed in memory and never stored. Read the <Link href="/privacy" className="text-[#9E7938] underline">Privacy Policy</Link> for exactly what is saved, and the <Link href="/terms" className="text-[#9E7938] underline">Terms of Service</Link> for the rules of use.</p>
      </InfoSection>
    </InfoPage>
  );
}
