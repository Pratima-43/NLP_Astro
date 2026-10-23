"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Star,
  Hash,
  Hand,
  FileBarChart,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Avatar } from "@/components/ui/Avatar";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Astrology", href: "/dashboard/astrology", icon: Star },
  { label: "Numerology", href: "/dashboard/numerology", icon: Hash },
  { label: "Palmistry", href: "/dashboard/palmistry", icon: Hand },
  { label: "Combined Report", href: "/dashboard/combined-report", icon: FileBarChart },
  { label: "AI Chatbot", href: "/dashboard/chatbot", icon: MessageCircle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, premium, logout, sidebarOpen, setSidebarOpen } = useApp();

  const isCollapsed = !sidebarOpen;

  return (
    <aside
      className={`hidden lg:flex flex-col bg-navy text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[72px]" : "w-64"
      } min-h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold tracking-tight">AstroVerse</span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center h-8 mx-2 mt-2 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isPremiumItem =
            item.href === "/dashboard/combined-report" ||
            item.href === "/dashboard/chatbot";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-gold/20 text-gold"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gold rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-gold" : ""}`} />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!isCollapsed && isPremiumItem && !premium.isActive && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || "User"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-white/50 truncate">
                {premium.isActive ? "Premium" : "Free Plan"}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
