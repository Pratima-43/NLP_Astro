import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = { title: "Privacy Policy · AstroVerse", description: "What AstroVerse stores, what it never stores, and how to delete your data." };

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Legal" title="Privacy Policy" updated="30 October 2026"
      intro="This page describes exactly what AstroVerse stores about you, who processes it, and how to delete it.">
      <InfoSection title="What we store">
        <ul>
          <li><strong>Account:</strong> your name, email address, and a salted scrypt hash of your password (never the password itself).</li>
          <li><strong>Profile:</strong> the birth details you enter (date, time and place of birth), gender if given, your dominant hand, and your notification preferences.</li>
          <li><strong>Readings:</strong> your numerology results, birth chart, palm measurements, chat conversations with the Guide, and combined reports, so you can return to them.</li>
          <li><strong>Premium:</strong> your plan, its dates, and the coupon code used.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Palm photos are never stored">
        <p>Your palm photo is analysed in server memory and discarded once the analysis finishes. We keep only the measurements derived from it (line lengths, positions, mount estimates and hand landmarks) and a SHA-256 fingerprint of the file. The fingerprint lets us show the same reading if you upload the same photo again; the photo cannot be recreated from it.</p>
        <p>If you save a palm photo in Settings or during onboarding, it stays in your own browser&apos;s local storage and is sent to the server only when you choose to analyse it.</p>
      </InfoSection>

      <InfoSection title="Who processes your data">
        <ul>
          <li><strong>Supabase</strong> hosts the database that holds the data listed above.</li>
          <li><strong>Groq</strong> runs the language model that writes your readings. It receives the computed features, the traditional claims selected for you, and your questions to the Guide. It does not receive your email address or password.</li>
          <li><strong>OpenStreetMap Nominatim</strong> receives the place name you type when you look up a birthplace.</li>
        </ul>
        <p>We do not sell your data or use it for advertising.</p>
      </InfoSection>

      <InfoSection id="security" title="Security">
        <p>Passwords are hashed with scrypt, sessions use signed tokens, and changing or resetting your password signs out every other device. Password reset links are single-use and expire after 30 minutes. If you find a security issue, please report it to the AstroVerse team privately rather than publicly.</p>
      </InfoSection>

      <InfoSection title="Deleting your data">
        <p>Go to <strong>Settings → Account → Delete account</strong>. This permanently removes your profile, readings, chat history and combined reports. Signing out also clears the session token and saved palm photo from your browser.</p>
      </InfoSection>
    </InfoPage>
  );
}
