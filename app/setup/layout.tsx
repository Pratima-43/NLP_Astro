import { Logo } from "@/components/brand/Logo";
import { RequireAccount } from "@/components/layout/AccountGates";
import { TextSizeMenu } from "@/components/ui/TextSizeMenu";

export default function SetupLayout({ children }: LayoutProps<"/setup">) {
  return (
    <RequireAccount area="setup">
      <div className="flex min-h-dvh flex-col">
        <header className="mx-auto flex h-18 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Logo href="/home" />
          <div className="ml-auto">
            <TextSizeMenu />
          </div>
        </header>
        <main id="main" className="flex flex-1 justify-center px-4 pb-16 pt-2 sm:pt-8">
          <div className="w-full max-w-xl">{children}</div>
        </main>
      </div>
    </RequireAccount>
  );
}
