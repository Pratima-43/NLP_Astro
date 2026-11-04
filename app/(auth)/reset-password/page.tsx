import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/layout/AccountGates";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

// The emailed link carries ?token=…, which is only known in the browser, so the form sits in Suspense.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader label="Checking your link…" />}>
      <ResetForm />
    </Suspense>
  );
}
