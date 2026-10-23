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
  X,
  Sparkles,
  LogOut,
  Crown,
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

export function MobileNavigation() {
  const pathname = usePathname();
  const { user, premium, logout, sidebarOpen, setSidebarOpen } = useApp();

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-navy z-50 lg:hidden animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AstroVerse</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User card */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || "User"} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          {premium.isActive && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gold">
              <Crown className="w-3.5 h-3.5" />
              <span className="font-medium">Premium Active</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-gold" : ""}`} />
                <span>{item.label}</span>
                {isPremiumItem && !premium.isActive && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
