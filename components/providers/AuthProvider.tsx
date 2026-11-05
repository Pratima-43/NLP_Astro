"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, UNAUTHORIZED_EVENT, apiFetch, getStoredToken, postJson, putJson, setStoredToken } from "@/lib/api";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";
import type { ProfileUpdate, UserProfile } from "@/types/user";

export type Result = { ok: true } | { ok: false; error: string };

type AuthState =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null; reason?: "manual" | "expired" }
  | { status: "signed-in"; user: UserProfile }
  | { status: "unavailable"; user: null; problem: string };

interface AuthValue {
  status: AuthState["status"];
  user: UserProfile | null;
  /** Why the session could not be checked (only when status is "unavailable"). */
  problem: string;
  /** Why the person is signed out: they chose to, or their session ended. */
  signedOutReason: "manual" | "expired" | null;
  isPremium: boolean;
  retry: () => void;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (name: string, email: string, password: string) => Promise<Result>;
  signOut: () => void;
  saveProfile: (updates: ProfileUpdate) => Promise<Result>;
  redeemCode: (code: string) => Promise<Result>;
  requestPasswordReset: (email: string) => Promise<Result & { message?: string }>;
  resetPassword: (token: string, password: string) => Promise<Result>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  deleteAccount: (password: string) => Promise<Result>;
}

const AuthContext = createContext<AuthValue | null>(null);

type AuthResponse = { access_token: string; user: UserProfile };

// Keys written by earlier versions of the app; removed so stale data never reappears.
const OLD_KEYS = [
  "astroverse_user", "astroverse_premium", "astroverse_onboarded", "astroverse_authenticated",
  "astroverse_conversations", "astroverse_client_id", "astroverse_palm_image",
];

function forgetOldKeys(): void {
  try {
    OLD_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable.
  }
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Map the app's field names to the API's profile payload. */
function toPayload(updates: ProfileUpdate): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.dateOfBirth !== undefined) payload.date_of_birth = updates.dateOfBirth || null;
  if (updates.timeOfBirth !== undefined) payload.time_of_birth = updates.timeOfBirth || "";
  if (updates.timeOfBirthUnknown !== undefined) payload.time_of_birth_unknown = updates.timeOfBirthUnknown;
  if (updates.placeOfBirth !== undefined) payload.place_of_birth = updates.placeOfBirth;
  if (updates.dominantHand !== undefined) payload.dominant_hand = updates.dominantHand;
  if (updates.onboarded !== undefined) payload.onboarded = updates.onboarded;
  if (updates.notificationPrefs !== undefined) payload.notification_prefs = updates.notificationPrefs;
  return payload;
}

/** Resolve the stored session to a user, or null when there is none. Throws when the API can't be reached. */
async function restoreSession(): Promise<UserProfile | null> {
  if (supabaseEnabled) {
    const { data } = await getSupabase()!.auth.getSession();
    if (!data.session) return null;
  } else if (!getStoredToken()) {
    return null;
  }
  try {
    return await apiFetch<UserProfile>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setStoredToken(null);
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    restoreSession()
      .then((user) => {
        if (cancelled) return;
        forgetOldKeys();
        setState(user ? { status: "signed-in", user } : { status: "signed-out", user: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "unavailable", user: null, problem: errorText(error, "We couldn't reach AstroVerse.") });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Any API call rejected with 401 means the session has ended (expired, or the password changed elsewhere).
  useEffect(() => {
    const onUnauthorized = () => {
      setStoredToken(null);
      setState({ status: "signed-out", user: null, reason: "expired" });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const retry = useCallback(() => {
    setState({ status: "loading", user: null });
    setAttempt((n) => n + 1);
  }, []);

  const startSession = useCallback((response: AuthResponse) => {
    setStoredToken(response.access_token);
    setState({ status: "signed-in", user: response.user });
  }, []);

  const loadUser = useCallback(async () => {
    const user = await apiFetch<UserProfile>("/auth/me");
    setState({ status: "signed-in", user });
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<Result> => {
    try {
      if (supabaseEnabled) {
        const { error } = await getSupabase()!.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: error.message };
        await loadUser();
        return { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/login", { email, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't sign you in. Please try again.") };
    }
  }, [loadUser, startSession]);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<Result> => {
    try {
      if (supabaseEnabled) {
        const { data, error } = await getSupabase()!.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) return { ok: false, error: error.message };
        if (!data.session) return { ok: false, error: "We sent you an email. Open the link in it to confirm your account, then sign in." };
        await loadUser();
        return { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/signup", { name, email, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't create your account. Please try again.") };
    }
  }, [loadUser, startSession]);

  const signOut = useCallback(() => {
    getSupabase()?.auth.signOut().catch(() => undefined);
    setStoredToken(null);
    forgetOldKeys();
    setState({ status: "signed-out", user: null, reason: "manual" });
  }, []);

  const saveProfile = useCallback(async (updates: ProfileUpdate): Promise<Result> => {
    try {
      const user = await putJson<UserProfile>("/auth/profile", toPayload(updates));
      setState({ status: "signed-in", user });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't save your details. Please try again.") };
    }
  }, []);

  const redeemCode = useCallback(async (code: string): Promise<Result> => {
    try {
      const user = await postJson<UserProfile>("/auth/premium/redeem", { coupon_code: code });
      setState({ status: "signed-in", user });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "That code didn't work. Please check it and try again.") };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<Result & { message?: string }> => {
    try {
      if (supabaseEnabled) {
        const { error } = await getSupabase()!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) return { ok: false, error: error.message };
        return { ok: true, message: "If an account uses that email, a reset link is on its way." };
      }
      const response = await postJson<{ message: string }>("/auth/password/forgot", { email });
      return { ok: true, message: response.message };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't send the reset link. Please try again.") };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string): Promise<Result> => {
    try {
      if (supabaseEnabled) {
        const supabase = getSupabase()!;
        // token_hash links are used only now, on submit, so an email scanner opening the link can't use it up.
        if (token) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: "recovery" });
          if (error) return { ok: false, error: "This reset link has expired or was already used. Please ask for a new one." };
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          const expired = /session missing|expired|invalid/i.test(error.message);
          return { ok: false, error: expired ? "This reset link has expired or was already used. Please ask for a new one." : error.message };
        }
        await loadUser();
        return { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/password/reset", { token, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't change your password. Please try again.") };
    }
  }, [loadUser, startSession]);

  const user = state.user;

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<Result> => {
    try {
      if (supabaseEnabled && user?.authProvider === "supabase") {
        const supabase = getSupabase()!;
        const { error: wrong } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
        if (wrong) return { ok: false, error: "Your current password is not right." };
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return error ? { ok: false, error: error.message } : { ok: true };
      }
      startSession(await postJson<AuthResponse>("/auth/password/change", { current_password: currentPassword, new_password: newPassword }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't change your password. Please try again.") };
    }
  }, [startSession, user]);

  const deleteAccount = useCallback(async (password: string): Promise<Result> => {
    try {
      await apiFetch("/auth/account", { method: "DELETE", body: JSON.stringify({ password: password || null, confirm: "DELETE" }) });
      signOut();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorText(error, "We couldn't delete your account. Please try again.") };
    }
  }, [signOut]);

  const value = useMemo<AuthValue>(() => ({
    status: state.status,
    user,
    problem: state.status === "unavailable" ? state.problem : "",
    signedOutReason: state.status === "signed-out" ? state.reason ?? null : null,
    isPremium: Boolean(user?.premium?.isActive),
    retry, signIn, signUp, signOut, saveProfile, redeemCode, requestPasswordReset, resetPassword, changePassword, deleteAccount,
  }), [state, user, retry, signIn, signUp, signOut, saveProfile, redeemCode, requestPasswordReset, resetPassword, changePassword, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}

/** For pages behind the account gate, where a user is guaranteed. */
export function useUser(): UserProfile {
  const { user } = useAuth();
  if (!user) throw new Error("useUser needs a signed-in user (wrap the page in <RequireAccount>).");
  return user;
}
