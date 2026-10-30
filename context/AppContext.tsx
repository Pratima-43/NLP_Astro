"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { PremiumEntitlement, UserProfile } from "@/types";
import { ApiError, UNAUTHORIZED_EVENT, apiFetch, getStoredToken, postJson, putJson, setStoredToken } from "@/lib/api";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

type Result = { ok: true } | { ok: false; error: string };

interface AppContextValue {
  // Auth (accounts live in the AstroVerse backend, or Supabase when configured)
  isAuthenticated: boolean;
  authLoading: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<Result>;
  signup: (name: string, email: string, password: string) => Promise<Result>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<Result>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<Result & { message?: string }>;
  resetPassword: (token: string, password: string) => Promise<Result>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  deleteAccount: (password: string) => Promise<Result>;

  // Premium (granted server-side)
  premium: PremiumEntitlement;
  activatePremiumAccess: (couponCode: string) => Promise<Result>;

  // Onboarding
  isOnboarded: boolean;
  completeOnboarding: (profile: Partial<UserProfile>) => Promise<Result>;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Palm photo preview from onboarding/settings (kept only in this browser)
  palmImageUrl: string | null;
  setPalmImageUrl: (url: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const FREE_PLAN: PremiumEntitlement = { isActive: false, plan: "Free Standard Tier" };
const PALM_KEY = "astroverse_palm_image";
// Keys written by the earlier demo login; removed so stale demo profiles never reappear.
const LEGACY_KEYS = ["astroverse_user", "astroverse_premium", "astroverse_onboarded", "astroverse_authenticated", "astroverse_conversations", "astroverse_client_id"];

type AuthResponse = { access_token: string; user: UserProfile };

function message(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Map the UI's camelCase profile fields to the backend's profile payload. */
function toProfilePayload(updates: Partial<UserProfile>): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  if (updates.name !== undefined) map.name = updates.name;
  if (updates.dateOfBirth !== undefined) map.date_of_birth = updates.dateOfBirth || null;
  if (updates.timeOfBirth !== undefined) map.time_of_birth = updates.timeOfBirth || "";
  if (updates.timeOfBirthUnknown !== undefined) map.time_of_birth_unknown = updates.timeOfBirthUnknown;
  if (updates.placeOfBirth !== undefined) map.place_of_birth = updates.placeOfBirth;
  if (updates.gender !== undefined) map.gender = updates.gender || null;
  if (updates.dominantHand !== undefined) map.dominant_hand = updates.dominantHand;
  if (updates.onboarded !== undefined) map.onboarded = updates.onboarded;
  if (updates.notificationPrefs !== undefined) map.notification_prefs = updates.notificationPrefs;
  return map;
}

// `hydrated` is false on the server and during hydration, true afterwards; nothing to subscribe to.
const subscribeNever = () => () => {};

function readPalmImage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PALM_KEY);
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [user, setUser] = useState<UserProfile | null>(null);
  // Resolving a stored session needs a network round trip; start in the loading state when one exists.
  const [authLoading, setAuthLoading] = useState(() => typeof window !== "undefined" && (supabaseEnabled || Boolean(getStoredToken())));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [palmImageUrl, setPalmImageUrlState] = useState<string | null>(readPalmImage);

  const clearSession = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    try {
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await apiFetch<UserProfile>("/auth/me"));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearSession();
      else throw error;
    }
  }, [clearSession]);

  // Restore the session once on load.
  useEffect(() => {
    if (!authLoading) return;
    let cancelled = false;
    (async () => {
      if (supabaseEnabled) {
        const { data } = await getSupabase()!.auth.getSession();
        if (!data.session) return;
      }
      await refreshUser();
    })()
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setAuthLoading(false); });
    return () => { cancelled = true; };
  }, [authLoading, refreshUser]);

  // Any API call rejected with 401 means the session is gone: sign out everywhere.
  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [clearSession]);

  const startSession = useCallback((response: AuthResponse) => {
    try {
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
    setStoredToken(response.access_token);
    setUser(response.user);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<Result> => {
    try {
      if (supabaseEnabled) {
        const { error } = await getSupabase()!.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: error.message };
        await refreshUser();
        return { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/login", { email, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Sign in failed. Please try again.") };
    }
  }, [refreshUser, startSession]);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<Result> => {
    try {
      if (supabaseEnabled) {
        const { data, error } = await getSupabase()!.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) return { ok: false, error: error.message };
        if (!data.session) return { ok: false, error: "Check your email to confirm your account, then sign in." };
        await refreshUser();
        return { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/signup", { name, email, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Could not create the account. Please try again.") };
    }
  }, [refreshUser, startSession]);

  const logout = useCallback(() => {
    getSupabase()?.auth.signOut().catch(() => undefined);
    clearSession();
    try {
      localStorage.removeItem(PALM_KEY);
    } catch {
      // ignore
    }
    setPalmImageUrlState(null);
  }, [clearSession]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<Result> => {
    try {
      setUser(await putJson<UserProfile>("/auth/profile", toProfilePayload(updates)));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Could not save your profile.") };
    }
  }, []);

  const completeOnboarding = useCallback(
    (profile: Partial<UserProfile>) => updateProfile({ ...profile, onboarded: true }),
    [updateProfile],
  );

  const activatePremiumAccess = useCallback(async (couponCode: string): Promise<Result> => {
    try {
      setUser(await postJson<UserProfile>("/auth/premium/redeem", { coupon_code: couponCode }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Could not activate Premium.") };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<Result & { message?: string }> => {
    try {
      if (supabaseEnabled) {
        const { error } = await getSupabase()!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) return { ok: false, error: error.message };
        return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
      }
      const response = await postJson<{ message: string }>("/auth/password/forgot", { email });
      return { ok: true, message: response.message };
    } catch (error) {
      return { ok: false, error: message(error, "Could not send the reset link. Please try again.") };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string): Promise<Result> => {
    try {
      if (supabaseEnabled) {
        // Supabase signs the user in from the emailed link; the new password is set on that session.
        const { error } = await getSupabase()!.auth.updateUser({ password });
        if (error) return { ok: false, error: error.message };
        await refreshUser();
        return { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/password/reset", { token, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Could not reset the password.") };
    }
  }, [refreshUser, startSession]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<Result> => {
    try {
      if (supabaseEnabled && user?.authProvider === "supabase") {
        const { error: signInError } = await getSupabase()!.auth.signInWithPassword({ email: user.email, password: currentPassword });
        if (signInError) return { ok: false, error: "Your current password is incorrect." };
        const { error } = await getSupabase()!.auth.updateUser({ password: newPassword });
        return error ? { ok: false, error: error.message } : { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/password/change", { current_password: currentPassword, new_password: newPassword }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Could not change the password.") };
    }
  }, [startSession, user]);

  const deleteAccount = useCallback(async (password: string): Promise<Result> => {
    try {
      await apiFetch("/auth/account", { method: "DELETE", body: JSON.stringify({ password: password || null, confirm: "DELETE" }) });
      logout();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error, "Could not delete the account.") };
    }
  }, [logout]);

  const setPalmImageUrl = useCallback((url: string | null) => {
    setPalmImageUrlState(url);
    try {
      if (url) localStorage.setItem(PALM_KEY, url);
      else localStorage.removeItem(PALM_KEY);
    } catch {
      // Large photos can exceed storage quota; the preview simply isn't kept.
    }
  }, []);

  if (!hydrated || authLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        authLoading,
        user,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
        requestPasswordReset,
        resetPassword,
        changePassword,
        deleteAccount,
        premium: user?.premium ?? FREE_PLAN,
        activatePremiumAccess,
        isOnboarded: Boolean(user?.onboarded),
        completeOnboarding,
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

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
