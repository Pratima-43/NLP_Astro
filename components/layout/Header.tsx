"use client";

import { usePathname } from "next/navigation";
import { Bell, Crown, Menu } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/astrology": "Astrology",
  "/dashboard/numerology": "Numerology",
  "/dashboard/palmistry": "Palmistry",
  "/dashboard/combined-report": "Combined Report",
  "/dashboard/chatbot": "AI Chatbot",
  "/dashboard/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { user, premium, setSidebarOpen } = useApp();

  const pageTitle = pageTitles[pathname] || "Dashboard";
  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <header className="sticky top-0 z-30 bg-ivory/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white transition-colors text-text-secondary"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-text">{pageTitle}</h1>
            {pathname === "/dashboard" && (
              <p className="text-sm text-text-secondary hidden sm:block">
                {greeting}, {firstName} ✨
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {premium.isActive ? (
            <Badge variant="gold" size="sm">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          ) : (
            <Badge variant="outline" size="sm">
              Free Plan
            </Badge>
          )}

          <button
            className="relative p-2 rounded-lg hover:bg-white transition-colors text-text-secondary"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          </button>

          <div className="hidden sm:block">
            <Avatar name={user?.name || "User"} size="sm" />
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
