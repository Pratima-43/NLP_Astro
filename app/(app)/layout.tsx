import { AppShell } from "@/components/layout/AppShell";
import { RequireAccount } from "@/components/layout/AccountGates";

export default function SignedInLayout({ children }: LayoutProps<"/">) {
  return (
    <RequireAccount area="app">
      <AppShell>{children}</AppShell>
    </RequireAccount>
  );
}
