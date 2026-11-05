import type { Metadata } from "next";
import { InfoArticle, InfoSection } from "@/components/layout/InfoArticle";

export const metadata: Metadata = { title: "Privacy Policy", description: "What AstroVerse keeps, what it never keeps, and how to delete your data." };

export default function PrivacyPage() {
  return (
    <InfoArticle
      title="Privacy Policy"
      updated="4 November 2026"
      intro="This page says exactly what AstroVerse keeps about you, who handles it, and how to delete it."
    >
      <InfoSection title="What we keep">
        <ul>
          <li><strong>Your account:</strong> your name, email address, and a scrambled (scrypt) version of your password. We never keep the password itself.</li>
          <li><strong>Your details:</strong> your birth date, time and place, the hand you write with, and your email settings.</li>
          <li><strong>Your readings:</strong> your numbers, birth chart, palm measurements, your questions and answers, and your full story, so you can come back to them.</li>
          <li><strong>Premium:</strong> your plan, its dates, and the code you used.</li>
        </ul>
      </InfoSection>

      <InfoSection title="We never keep your palm photo">
        <p>Your palm photo is measured in our server’s memory and deleted as soon as the measuring is done. We keep only the measurements (such as line lengths and positions) and a fingerprint of the file (a SHA-256 code). The fingerprint lets us show the same reading if you send the same photo again. The photo can’t be rebuilt from it.</p>
      </InfoSection>

      <InfoSection title="Who handles your data">
        <ul>
          <li><strong>Supabase</strong> hosts the database that holds the data listed above.</li>
          <li><strong>Groq</strong> runs the AI writer. It receives the results of the sums, the traditional statements chosen for you, and your questions. It does not receive your name, email address or password.</li>
          <li><strong>OpenStreetMap Nominatim</strong> receives the place name you type when you look up where you were born.</li>
        </ul>
        <p>We do not sell your data or use it for advertising.</p>
      </InfoSection>

      <InfoSection id="security" title="Keeping your account safe">
        <p>Passwords are scrambled with scrypt, sign-ins use signed tokens, and changing or resetting your password signs out every other device. Password reset links work once and expire after 30 minutes. If you find a security problem, please tell the AstroVerse team privately.</p>
      </InfoSection>

      <InfoSection title="Deleting your data">
        <p>Go to <strong>Me → Delete my account</strong>. This permanently removes your details, readings, questions and full story. Signing out removes your sign-in from this browser.</p>
      </InfoSection>
    </InfoArticle>
  );
}
