import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle, InfoSection } from "@/components/layout/InfoArticle";

export const metadata: Metadata = { title: "About", description: "What AstroVerse is, how each reading is worked out, and the books behind it." };

export default function AboutPage() {
  return (
    <InfoArticle
      title="About AstroVerse"
      intro="AstroVerse gives you three readings from three old traditions, explains them in plain words, and shows where they agree."
    >
      <InfoSection title="What it does">
        <ul>
          <li><strong>Your Numbers (numerology)</strong> turns your name and birthday into four numbers: your birth-day number (Moolank), life-path number (Bhagyank), name number (Namank) and this year’s number (Personal Year).</li>
          <li><strong>Your Stars (Vedic astrology)</strong> works out where the sun, moon and planets were when you were born, and reads them with classical rules.</li>
          <li><strong>Your Hand (palmistry)</strong> finds the main lines on a photo of your palm, measures them, and reads them the way the palmist Cheiro described.</li>
          <li><strong>Your Full Story and Ask</strong> put all three side by side, show where they agree or differ, and answer your questions from your own readings.</li>
        </ul>
      </InfoSection>

      <InfoSection id="research" title="How we keep it honest">
        <p>First, the computer does the sums: there is no guessing in the numbers, the planet positions or the palm measurements. Then we look up what traditional books say about those exact results. Only then does an AI writer turn those statements into friendly sentences, and every sentence must point back to a statement it used. Anything that doesn’t is removed before you see it.</p>
        <ul>
          <li><strong>Numbers:</strong> the Chaldean letter table and the reduction rules, with meanings from the research team’s Numerology Guide.</li>
          <li><strong>Stars:</strong> planet positions from the Swiss Ephemeris in the sidereal (star-based) zodiac with the Lahiri setting, whole-sign houses, and classical Parashari rules from Brihat Parashara Hora Shastra, Phaladeepika and Brihat Jataka.</li>
          <li><strong>Hand:</strong> hand points from Google’s MediaPipe, crease tracing on the photo, and meanings quoted from Cheiro’s <em>Palmistry for All</em> (1916). Passages about illness and lifespan were left out.</li>
        </ul>
      </InfoSection>

      <InfoSection title="What it is not">
        <p>Numerology, astrology and palmistry are traditional practices, not science. AstroVerse shows what these traditions say, for reflection and fun. It is not medical, legal, financial or psychological advice, and nothing in it predicts health or lifespan.</p>
      </InfoSection>

      <InfoSection title="Your data">
        <p>Palm photos are measured and then deleted. Read the <Link href="/privacy">Privacy Policy</Link> for exactly what we keep, and the <Link href="/terms">Terms</Link> for the rules of use.</p>
      </InfoSection>
    </InfoArticle>
  );
}
