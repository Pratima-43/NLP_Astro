import type { Metadata } from "next";
import { InfoArticle, InfoSection } from "@/components/layout/InfoArticle";

export const metadata: Metadata = { title: "Terms of Service", description: "The rules for using AstroVerse." };

export default function TermsPage() {
  return (
    <InfoArticle title="Terms of Service" updated="4 November 2026" intro="By creating an account or using AstroVerse you agree to these terms.">
      <InfoSection title="What AstroVerse is">
        <p>AstroVerse shows what numerology, Vedic astrology and palmistry say about you. These are traditional practices, not science. Readings are for reflection and fun and are not professional advice of any kind: medical, psychological, legal or financial. Please don’t make important decisions based on them alone.</p>
      </InfoSection>

      <InfoSection title="Your account">
        <ul>
          <li>Give true details and keep your password private. You are responsible for what happens on your account.</li>
          <li>Only send photos of your own hand, or of someone who has said yes.</li>
          <li>Don’t misuse the service: no automated scraping, attempts to break security, or overloading the system.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Premium">
        <p>Premium (Your Full Story and Ask) is currently unlocked with codes. A code gives access for the time shown when you use it. We may change or end codes for new users without taking away access already given.</p>
      </InfoSection>

      <InfoSection title="AI-written text">
        <p>Readings are written by an AI from the statements shown under “How we worked this out” in each reading. AI-written text can contain mistakes; those sections show the underlying data so you can check it.</p>
      </InfoSection>

      <InfoSection title="Stopping">
        <p>You can delete your account at any time from the Me page. We may suspend accounts that break these terms.</p>
      </InfoSection>

      <InfoSection title="Liability">
        <p>The service is provided as it is. As far as the law allows, AstroVerse is not responsible for decisions made because of its readings.</p>
      </InfoSection>
    </InfoArticle>
  );
}
