"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCircle2, Crown, Hand, Hash, LogOut, Menu, MessageCircle, Settings, Sparkles, Star, UserRound } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api";
import type { IntegrationStatus } from "@/types/readings";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/astrology": "Astrology",
  "/dashboard/numerology": "Numerology",
  "/dashboard/palmistry": "Palmistry",
  "/dashboard/combined-report": "Combined Report",
  "/dashboard/chatbot": "AI Chatbot",
  "/dashboard/settings": "Settings",
};

type Notice = { id: string; icon: typeof Bell; title: string; body: string; href: string };

const MODULES = [
  { key: "numerology", label: "Numerology", icon: Hash, href: "/dashboard/numerology" },
  { key: "astrology", label: "Vedic Astrology", icon: Star, href: "/dashboard/astrology" },
  { key: "palmistry", label: "Palmistry", icon: Hand, href: "/dashboard/palmistry" },
] as const;

/** Close a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) close(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, premium, setSidebarOpen, logout } = useApp();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [seenKey, setSeenKey] = useState<string | null>(() => {
    try { return localStorage.getItem(`astroverse_seen_notices_${user?.id}`); } catch { return null; }
  });
  const closeNotes = useCallback(() => setNotesOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const notesRef = useDismiss(notesOpen, closeNotes);
  const menuRef = useDismiss(menuOpen, closeMenu);

  // Refresh reading status on every page change so notifications follow what the user just did.
  useEffect(() => {
    apiFetch<IntegrationStatus>("/integration/status").then(setStatus).catch(() => setStatus(null));
  }, [pathname]);

  const notices = useMemo<Notice[]>(() => {
    const list: Notice[] = [];
    const prefs = user?.notificationPrefs;
    if (prefs?.progress_updates !== false && user && (!user.dateOfBirth || !user.placeOfBirth)) {
      list.push({ id: "profile", icon: UserRound, title: "Complete your birth details", body: "Your date and place of birth make the readings accurate.", href: "/dashboard/settings" });
    }
    if (status) {
      const missing = MODULES.filter((m) => !status[m.key].available);
      if (prefs?.reading_reminders !== false) {
        missing.forEach((m) => list.push({ id: `missing-${m.key}`, icon: m.icon, title: `Your ${m.label} reading is waiting`, body: "Generate it to add its evidence to your guidance.", href: m.href }));
      }
      if (!missing.length && prefs?.progress_updates !== false) {
        list.push({ id: "all-ready", icon: CheckCircle2, title: "All three readings are ready", body: premium.isActive ? "Ask the Guide or open your Combined Report." : "Unlock Premium to combine them.", href: premium.isActive ? "/dashboard/chatbot" : "/pricing" });
      }
    }
    if (!premium.isActive && prefs?.premium_offers !== false) {
      list.push({ id: "premium", icon: Crown, title: "Unlock the Guide and Combined Report", body: "Redeem coupon ASTROFREE on the Pricing page.", href: "/pricing" });
    }
    return list;
  }, [status, user, premium.isActive]);

  const noticeKey = notices.map((n) => n.id).join("|");
  const unread = notices.length > 0 && noticeKey !== seenKey;

  function openNotes() {
    setMenuOpen(false);
    setNotesOpen((open) => !open);
    setSeenKey(noticeKey);
    try { localStorage.setItem(`astroverse_seen_notices_${user?.id}`, noticeKey); } catch { /* ignore */ }
  }

  function signOut() {
    setMenuOpen(false);
    logout();
    router.replace("/login");
  }

  const pageTitle = pageTitles[pathname] || "Dashboard";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <header className="sticky top-0 z-30 bg-ivory/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white transition-colors text-text-secondary" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-text">{pageTitle}</h1>
            {pathname === "/dashboard" && <p className="text-sm text-text-secondary hidden sm:block">{getGreeting()}, {firstName} ✨</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href={premium.isActive ? "/dashboard/settings" : "/pricing"} className="hidden sm:block">
            {premium.isActive
              ? <Badge variant="gold" size="sm"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
              : <Badge variant="outline" size="sm">Free Plan</Badge>}
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notesRef}>
            <button onClick={openNotes} aria-haspopup="dialog" aria-expanded={notesOpen} aria-label={`Notifications${unread ? " (new)" : ""}`}
              className={`relative p-2 rounded-lg transition-colors text-text-secondary ${notesOpen ? "bg-white" : "hover:bg-white"}`}>
              <Bell className="w-5 h-5" />
              {unread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />}
            </button>
            {notesOpen && (
              <div role="dialog" aria-label="Notifications" className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">Notifications</p>
                  <span className="text-[11px] text-text-secondary">{notices.length} item{notices.length === 1 ? "" : "s"}</span>
                </div>
                {notices.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-secondary text-center flex flex-col items-center gap-2"><Sparkles className="w-5 h-5 text-gold" />You&apos;re all caught up.</p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto divide-y divide-border/70">
                    {notices.map((n) => (
                      <li key={n.id}>
                        <Link href={n.href} onClick={closeNotes} className="flex gap-3 px-4 py-3 hover:bg-ivory transition-colors">
                          <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0"><n.icon className="w-4 h-4 text-gold" /></span>
                          <span><span className="block text-sm font-medium text-text">{n.title}</span><span className="block text-xs text-text-secondary mt-0.5">{n.body}</span></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/dashboard/settings?section=notifications" onClick={closeNotes} className="block px-4 py-2.5 border-t border-border text-xs text-center text-gold-dark hover:bg-ivory">Notification settings</Link>
              </div>
            )}
          </div>

          {/* Profile menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => { setNotesOpen(false); setMenuOpen((open) => !open); }} aria-haspopup="menu" aria-expanded={menuOpen} aria-label="Account menu"
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50">
              <Avatar name={user?.name || "User"} size="sm" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text truncate">{user?.name}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-gold-dark flex items-center gap-1"><Crown className="w-3 h-3" />{premium.plan}</p>
                </div>
                <div className="py-1">
                  <Link role="menuitem" href="/dashboard/settings" onClick={closeMenu} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text hover:bg-ivory"><Settings className="w-4 h-4 text-text-secondary" />Profile &amp; settings</Link>
                  <Link role="menuitem" href="/dashboard/chatbot" onClick={closeMenu} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text hover:bg-ivory"><MessageCircle className="w-4 h-4 text-text-secondary" />Ask the Guide</Link>
                  {!premium.isActive && <Link role="menuitem" href="/pricing" onClick={closeMenu} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text hover:bg-ivory"><Crown className="w-4 h-4 text-gold" />Upgrade to Premium</Link>}
                </div>
                <button role="menuitem" onClick={signOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 border-t border-border"><LogOut className="w-4 h-4" />Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
