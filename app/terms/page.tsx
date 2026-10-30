import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = { title: "Terms of Service · AstroVerse", description: "The rules for using AstroVerse." };

export default function TermsPage() {
  return (
    <InfoPage eyebrow="Legal" title="Terms of Service" updated="30 October 2026"
      intro="By creating an account or using AstroVerse you agree to these terms.">
      <InfoSection title="Nature of the service">
        <p>AstroVerse presents interpretations from numerology, Vedic astrology and palmistry. These are traditional practices, not scientifically validated methods. Readings are for reflection and entertainment and are not professional advice of any kind: medical, psychological, legal or financial. Do not make important decisions based on them alone.</p>
      </InfoSection>

      <InfoSection title="Your account">
        <ul>
          <li>Give accurate details and keep your password private. You are responsible for activity on your account.</li>
          <li>Upload only photos of your own hand, or of someone who has agreed to it.</li>
          <li>Do not misuse the service: no automated scraping, attempts to break security, or overloading the system.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Premium access">
        <p>Premium features (the Guide and the Combined Report) are currently unlocked with coupon codes. A coupon grants access for the period shown when you redeem it. We may change or end coupons for new redemptions without affecting access already granted.</p>
      </InfoSection>

      <InfoSection title="Generated content">
        <p>Readings are written by a language model from the evidence shown in each reading&apos;s detailed calculation. Generated text can contain mistakes; the calculation sections show the underlying data so you can check it.</p>
      </InfoSection>

      <InfoSection title="Ending your use">
        <p>You can delete your account at any time from Settings → Account. We may suspend accounts that break these terms.</p>
      </InfoSection>

      <InfoSection title="Liability">
        <p>The service is provided as is. To the extent the law allows, AstroVerse is not liable for decisions made on the basis of its readings.</p>
      </InfoSection>
    </InfoPage>
  );
}
