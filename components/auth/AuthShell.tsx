import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

/** Centered card used by the password reset pages, matching the sign-in card. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF7F0] star-field flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md mb-4">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[#77736B] hover:text-[#C6A15B] transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to sign in
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8DFCF] overflow-hidden">
        <div className="h-2 w-full gold-gradient" />
        <div className="p-8 sm:p-10">
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-3 shadow-md"><Sparkles className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-extrabold text-[#171B2D] tracking-tight">{title}</h1>
            <p className="text-sm text-[#77736B] mt-1.5">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export const authInputClass =
  "w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DFCF] bg-[#FAF7F0]/40 text-sm text-[#252525] placeholder-[#77736B]/60 outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 focus:bg-white transition-all";
