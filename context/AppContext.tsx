"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserProfile, PremiumEntitlement, ChatConversation, ChatMessage } from "@/types";
import { getDefaultProfile } from "@/lib/mockAuth";
import { getDefaultEntitlement, activatePremium } from "@/lib/mockEntitlements";

// ── Context Shape ─────────────────────────────────────────────
interface AppContextValue {
  // Auth
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Premium
  premium: PremiumEntitlement;
  activatePremiumAccess: (couponCode?: string) => void;

  // Onboarding
  isOnboarded: boolean;
  completeOnboarding: (profile: Partial<UserProfile>) => void;

  // Chatbot
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  setActiveConversation: (conv: ChatConversation | null) => void;
  addMessage: (message: ChatMessage) => void;
  startNewConversation: () => void;
  clearConversation: () => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Palm image
  palmImageUrl: string | null;
  setPalmImageUrl: (url: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Storage Keys ──────────────────────────────────────────────
const STORAGE_KEYS = {
  user: "astroverse_user",
  premium: "astroverse_premium",
  onboarded: "astroverse_onboarded",
  authenticated: "astroverse_authenticated",
  conversations: "astroverse_conversations",
  palmImage: "astroverse_palm_image",
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// ── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [premium, setPremium] = useState<PremiumEntitlement>(getDefaultEntitlement());
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [palmImageUrl, setPalmImageUrl] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setIsAuthenticated(loadFromStorage(STORAGE_KEYS.authenticated, false));
    setUser(loadFromStorage<UserProfile | null>(STORAGE_KEYS.user, null));
    setPremium(loadFromStorage(STORAGE_KEYS.premium, getDefaultEntitlement()));
    setIsOnboarded(loadFromStorage(STORAGE_KEYS.onboarded, false));
    setConversations(loadFromStorage(STORAGE_KEYS.conversations, []));
    setPalmImageUrl(loadFromStorage(STORAGE_KEYS.palmImage, null));
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.authenticated, isAuthenticated);
  }, [isAuthenticated, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.user, user);
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.premium, premium);
  }, [premium, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.onboarded, isOnboarded);
  }, [isOnboarded, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.conversations, conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.palmImage, palmImageUrl);
  }, [palmImageUrl, hydrated]);

  const login = useCallback((email: string, _password: string): boolean => {
    if (!email.includes("@")) return false;
    const existingUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.user, null);
    const profile = existingUser || getDefaultProfile();
    if (!existingUser) {
      profile.email = email;
    }
    setUser(profile);
    setIsAuthenticated(true);
    const wasOnboarded = loadFromStorage(STORAGE_KEYS.onboarded, false);
    setIsOnboarded(wasOnboarded);
    return true;
  }, []);

  const signup = useCallback((name: string, email: string, _password: string): boolean => {
    if (!email.includes("@") || !name.trim()) return false;
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      dateOfBirth: "",
      timeOfBirth: "",
      placeOfBirth: "",
    };
    setUser(profile);
    setIsAuthenticated(true);
    setIsOnboarded(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setPremium(getDefaultEntitlement());
    setIsOnboarded(false);
    setConversations([]);
    setActiveConversation(null);
    setPalmImageUrl(null);
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (typeof window !== "undefined") localStorage.removeItem(key);
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const activatePremiumAccess = useCallback((couponCode?: string) => {
    const entitlement = activatePremium(couponCode);
    setPremium(entitlement);
  }, []);

  const completeOnboarding = useCallback((profile: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : prev));
    setIsOnboarded(true);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setConversations((prev) => {
      const updated = [...prev];
      if (updated.length === 0 || !activeConversation) {
        const newConv: ChatConversation = {
          id: crypto.randomUUID(),
          title: message.role === "user" ? message.content.slice(0, 40) + "..." : "New Conversation",
          messages: [message],
          createdAt: new Date().toISOString(),
        };
        updated.push(newConv);
        setTimeout(() => setActiveConversation(newConv), 0);
        return updated;
      }
      const idx = updated.findIndex((c) => c.id === activeConversation.id);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          messages: [...updated[idx].messages, message],
        };
        setTimeout(() => setActiveConversation(updated[idx]), 0);
      }
      return updated;
    });
  }, [activeConversation]);

  const startNewConversation = useCallback(() => {
    const newConv: ChatConversation = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [...prev, newConv]);
    setActiveConversation(newConv);
  }, []);

  const clearConversation = useCallback(() => {
    if (activeConversation) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id ? { ...c, messages: [] } : c
        )
      );
      setActiveConversation((prev) => (prev ? { ...prev, messages: [] } : null));
    }
  }, [activeConversation]);

  // Don't render children until hydrated to prevent mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        updateProfile,
        premium,
        activatePremiumAccess,
        isOnboarded,
        completeOnboarding,
        conversations,
        activeConversation,
        setActiveConversation,
        addMessage,
        startNewConversation,
        clearConversation,
        sidebarOpen,
        setSidebarOpen,
        palmImageUrl,
        setPalmImageUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
