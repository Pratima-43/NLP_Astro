import type { Metadata } from "next";
import { PremiumView } from "./premium-view";

export const metadata: Metadata = { title: "Premium" };

export default function PremiumPage() {
  return <PremiumView />;
}
