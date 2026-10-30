import { getSupabase, supabaseEnabled } from "@/lib/supabase";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

const TOKEN_KEY = "astroverse_token";
/** Fired when the API rejects the session, so the app can sign the user out. */
export const UNAUTHORIZED_EVENT = "astroverse:unauthorized";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable; the session lasts until the tab closes.
  }
}

/** Supabase session token when Supabase Auth is configured, otherwise the AstroVerse token. */
async function getAccessToken(): Promise<string | null> {
  if (supabaseEnabled) {
    const { data } = await getSupabase()!.auth.getSession();
    return data.session?.access_token ?? null;
  }
  return getStoredToken();
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1${path}`, { ...init, headers });
  } catch {
    throw new ApiError(`Cannot reach the AstroVerse API at ${API_BASE_URL}. Start the FastAPI server (uvicorn app.main:app --port 8000).`, 0);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const message = typeof detail === "string"
      ? detail
      : Array.isArray(detail) && detail[0]?.msg ? String(detail[0].msg).replace(/^Value error, /, "") : "The server could not complete this request.";
    if (response.status === 401 && token && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: message }));
    }
    throw new ApiError(message, response.status);
  }
  return body as T;
}

export function postJson<T>(path: string, payload: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(payload) });
}

export function putJson<T>(path: string, payload: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PUT", body: JSON.stringify(payload) });
}

/** Load the latest saved reading, returning null when none exists yet. */
export async function getLatest<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
