import type { Metadata } from "next";
import { SetupWizard } from "./setup-wizard";

export const metadata: Metadata = { title: "About you" };

export default function SetupPage() {
  return <SetupWizard />;
}
