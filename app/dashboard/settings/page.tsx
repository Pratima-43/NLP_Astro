"use client";

import { Suspense, useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, User, Hand, Bell, Crown, LogOut, Save, Check, Upload, X, KeyRound, Trash2, ScanLine } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DateField, TimeField } from "@/components/ui/DateTimeFields";
import { ACCEPTED_IMAGE_TYPES, imageFileToDataUrl } from "@/lib/image";
import type { NotificationPrefs } from "@/types";

const NOTIFICATION_OPTIONS: Array<{ key: keyof NotificationPrefs; label: string; desc: string }> = [
  { key: "reading_reminders", label: "Reading reminders", desc: "Bell alerts for readings you have not generated yet" },
  { key: "progress_updates", label: "Progress updates", desc: "Missing birth details, and when all three readings are ready" },
  { key: "premium_offers", label: "Premium offers", desc: "Reminders about unlocking the Guide and Combined Report" },
  { key: "security_emails", label: "Security emails", desc: "Email me when my password is changed or reset" },
];
const DEFAULT_PREFS: NotificationPrefs = { reading_reminders: true, progress_updates: true, premium_offers: true, security_emails: true };
const FIELD = "w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-sm text-[#252525]";

function ChangePasswordCard() {
  const { changePassword } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) return setStatus({ ok: false, text: "Use at least 8 characters with letters and numbers." });
    if (next !== confirm) return setStatus({ ok: false, text: "The new passwords don't match." });
    setBusy(true);
    const result = await changePassword(current, next);
    setBusy(false);
    if (!result.ok) return setStatus({ ok: false, text: result.error });
    setCurrent(""); setNext(""); setConfirm("");
    setStatus({ ok: true, text: "Password changed. Other devices have been signed out." });
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-3">
      <h3 className="font-semibold text-[#252525] flex items-center gap-2"><KeyRound className="w-4 h-4 text-[#C6A15B]" />Change password</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="password" autoComplete="current-password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className={FIELD} />
        <input type="password" autoComplete="new-password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} className={FIELD} />
        <input type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={FIELD} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !current || !next} className="px-4 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] disabled:opacity-50">{busy ? "Saving…" : "Update password"}</button>
        <Link href="/forgot-password" className="text-xs text-[#77736B] hover:text-[#C6A15B]">Forgot your current password?</Link>
        {status && <p role="status" className={`text-xs ${status.ok ? "text-[#4A7C59]" : "text-[#C45B5B]"}`}>{status.text}</p>}
      </div>
    </form>
  );
}

function DeleteAccountCard() {
  const router = useRouter();
  const { user, deleteAccount } = useApp();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const needsPassword = user?.hasPassword !== false;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await deleteAccount(password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    router.replace("/");
  }

  function cancel() {
    setOpen(false); setPassword(""); setTyped(""); setError("");
  }

  return (
    <div className="bg-white rounded-xl border border-[#C45B5B]/30 p-6 space-y-3">
      <h3 className="font-semibold text-[#C45B5B] flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete account</h3>
      <p className="text-sm text-[#77736B]">Permanently deletes your profile, all saved readings, chat history and combined reports. This cannot be undone.</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-lg border border-[#C45B5B] text-[#C45B5B] text-sm font-medium hover:bg-[#C45B5B]/5">Delete my account…</button>
      ) : (
        <form onSubmit={submit} className="space-y-3 p-4 rounded-lg bg-[#C45B5B]/5 border border-[#C45B5B]/20">
          {needsPassword && <input type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${FIELD} bg-white`} />}
          <input placeholder="Type DELETE to confirm" value={typed} onChange={(e) => setTyped(e.target.value)} className={`${FIELD} bg-white`} />
          {error && <p role="alert" className="text-xs text-[#C45B5B]">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || typed !== "DELETE" || (needsPassword && !password)} className="px-4 py-2 rounded-lg bg-[#C45B5B] text-white text-sm font-medium hover:bg-[#A34545] disabled:opacity-50">{busy ? "Deleting…" : "Delete permanently"}</button>
            <button type="button" onClick={cancel} className="px-4 py-2 rounded-lg border border-[#E8DFCF] text-[#77736B] text-sm hover:bg-white">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user, premium, updateProfile, logout, palmImageUrl, setPalmImageUrl } = useApp();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") ?? "profile";
  const setActiveSection = (id: string) => router.replace(`/dashboard/settings?section=${id}`, { scroll: false });
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [dob, setDob] = useState(user?.dateOfBirth || "");
  const [timeOfBirth, setTimeOfBirth] = useState(user?.timeOfBirth || "");
  const [place, setPlace] = useState(user?.placeOfBirth || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [timeUnknown, setTimeUnknown] = useState(user?.timeOfBirthUnknown || false);
  const [dominantHand, setDominantHand] = useState<"left" | "right">(user?.dominantHand || "right");

  const prefs = user?.notificationPrefs ?? DEFAULT_PREFS;
  const [prefError, setPrefError] = useState("");
  const [palmError, setPalmError] = useState("");
  const [handSaved, setHandSaved] = useState(false);

  const togglePref = async (key: keyof NotificationPrefs) => {
    setPrefError("");
    const result = await updateProfile({ notificationPrefs: { ...prefs, [key]: !prefs[key] } });
    if (!result.ok) setPrefError(result.error);
  };

  const chooseHand = async (hand: "left" | "right") => {
    setDominantHand(hand);
    const result = await updateProfile({ dominantHand: hand });
    if (result.ok) { setHandSaved(true); setTimeout(() => setHandSaved(false), 2000); }
  };

  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { setSaveError("Name cannot be empty."); return; }
    setSaving(true);
    setSaveError("");
    const result = await updateProfile({
      name: name.trim(),
      dateOfBirth: dob,
      timeOfBirth: timeUnknown ? "" : timeOfBirth,
      timeOfBirthUnknown: timeUnknown,
      placeOfBirth: place.trim(),
      gender: gender || undefined,
      dominantHand,
    });
    setSaving(false);
    if (!result.ok) { setSaveError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePalmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { setPalmError("Please choose a JPEG, PNG or WebP photo."); return; }
    setPalmError("");
    try {
      setPalmImageUrl(await imageFileToDataUrl(file));
    } catch {
      setPalmError("Could not read this photo. Try another one.");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sections = [
    { id: "profile", label: "Personal Information", icon: User },
    { id: "palm", label: "Palm Image", icon: Hand },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "premium", label: "Premium Access", icon: Crown },
    { id: "account", label: "Account", icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Success banner */}
      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[#4A7C59]/10 border border-[#4A7C59]/20 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#4A7C59]" />
          <span className="text-sm text-[#4A7C59] font-medium">Settings saved successfully!</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Nav */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                  activeSection === s.id ? "bg-[#C6A15B]/10 text-[#C6A15B]" : "text-[#77736B] hover:text-[#252525] hover:bg-white"
                }`}>
                <s.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === "profile" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-4">
              <h3 className="font-semibold text-[#252525]">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Email</label>
                  <input type="email" value={user?.email || ""} readOnly aria-readonly="true" title="Your sign-in email cannot be changed here"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] bg-[#FAF7F0] text-[#77736B] outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Date of Birth</label>
                  <DateField value={dob} onChange={setDob} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Time of Birth</label>
                  <TimeField value={timeOfBirth} onChange={setTimeOfBirth} disabled={timeUnknown} />
                  <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="w-4 h-4 rounded border-[#E8DFCF] text-[#C6A15B]" />
                    <span className="text-xs text-[#77736B]">Time unknown</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Place of Birth</label>
                  <input type="text" value={place} onChange={(e) => setPlace(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="select-gold w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]">
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] transition-colors disabled:opacity-60">
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
                </button>
                {saveError && <p role="alert" className="text-xs text-[#C45B5B]">{saveError}</p>}
              </div>
            </div>
          )}

          {activeSection === "palm" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-[#252525]">Palm Image</h3>
                <p className="text-xs text-[#77736B] mt-0.5">Saved only in this browser, ready to analyse on the Palmistry page. The server never stores your photo.</p>
              </div>
              {palmImageUrl ? (
                <div className="relative w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL */}
                  <img src={palmImageUrl} alt="Palm" className="w-64 h-48 object-cover rounded-xl border border-[#E8DFCF]" />
                  <button onClick={() => setPalmImageUrl(null)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50"><X className="w-3.5 h-3.5 text-[#C45B5B]" /></button>
                </div>
              ) : (
                <div className="w-64 h-48 border-2 border-dashed border-[#E8DFCF] rounded-xl flex flex-col items-center justify-center text-[#77736B]">
                  <Hand className="w-8 h-8 mb-2 opacity-40" />
                  <span className="text-sm">No palm image uploaded</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C6A15B] text-[#C6A15B] text-sm font-medium hover:bg-[#C6A15B]/5 transition-colors">
                  <Upload className="w-4 h-4" /> {palmImageUrl ? "Replace" : "Upload"} Image
                </button>
                {palmImageUrl && (
                  <Link href="/dashboard/palmistry" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] transition-colors">
                    <ScanLine className="w-4 h-4" /> Analyse this photo
                  </Link>
                )}
              </div>
              {palmError && <p role="alert" className="text-xs text-[#C45B5B]">{palmError}</p>}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePalmUpload} className="hidden" ref={fileRef} />
              <div>
                <p className="text-sm font-medium text-[#252525] mb-2">Dominant Hand</p>
                <div className="flex items-center gap-2">
                  {(["left", "right"] as const).map((h) => (
                    <button key={h} onClick={() => chooseHand(h)} aria-pressed={dominantHand === h}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        dominantHand === h ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#C6A15B]" : "border-[#E8DFCF] text-[#77736B]"
                      }`}>{h}</button>
                  ))}
                  {handSaved && <span className="text-xs text-[#4A7C59] flex items-center gap-1"><Check className="w-3.5 h-3.5" />Saved</span>}
                </div>
                <p className="text-[11px] text-[#77736B] mt-1.5">Used as the default hand on the Palmistry page.</p>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-[#252525]">Notification Preferences</h3>
                <p className="text-xs text-[#77736B] mt-0.5">Saved to your account. In-app alerts appear under the bell icon.</p>
              </div>
              {NOTIFICATION_OPTIONS.map((n) => (
                <div key={n.key} className="flex items-center justify-between gap-4 py-2 border-b border-[#E8DFCF] last:border-0">
                  <div><p className="text-sm font-medium text-[#252525]">{n.label}</p><p className="text-xs text-[#77736B]">{n.desc}</p></div>
                  <button role="switch" aria-checked={prefs[n.key]} aria-label={n.label} onClick={() => togglePref(n.key)}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${prefs[n.key] ? "bg-[#C6A15B]" : "bg-[#E8DFCF]"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${prefs[n.key] ? "left-5.5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
              {prefError && <p role="alert" className="text-xs text-[#C45B5B]">{prefError}</p>}
            </div>
          )}

          {activeSection === "premium" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-4">
              <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Crown className="w-5 h-5 text-[#C6A15B]" /> Premium Access</h3>
              {premium.isActive ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] font-semibold">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Plan</p><p className="font-semibold text-[#252525]">{premium.plan}</p></div>
                    <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Coupon Used</p><p className="font-semibold text-[#C6A15B]">{premium.couponUsed || "None"}</p></div>
                    <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Activated</p><p className="font-semibold text-[#252525]">{premium.activatedAt ? new Date(premium.activatedAt).toLocaleDateString() : "—"}</p></div>
                    <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Expires</p><p className="font-semibold text-[#252525]">{premium.expiresAt ? new Date(premium.expiresAt).toLocaleDateString() : "—"}</p></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#77736B] mb-3">You are on the Free plan. Upgrade to access Combined Reports and AI Chatbot.</p>
                  <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] transition-colors">
                    Upgrade to Premium
                  </a>
                </div>
              )}
            </div>
          )}

          {activeSection === "account" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-6">
                <h3 className="font-semibold text-[#252525] mb-1">Signed in as</h3>
                <p className="text-sm text-[#77736B] mb-4">{user?.email}{user?.authProvider === "supabase" ? " · Supabase account" : ""}</p>
                <div className="space-y-3">
                  {!showLogoutConfirm ? (
                    <button onClick={() => setShowLogoutConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C45B5B] text-[#C45B5B] text-sm font-medium hover:bg-[#C45B5B]/5 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  ) : (
                    <div className="p-4 bg-[#C45B5B]/5 rounded-lg border border-[#C45B5B]/20">
                      <p className="text-sm text-[#252525] mb-3">Are you sure you want to logout?</p>
                      <div className="flex gap-2">
                        <button onClick={handleLogout}
                          className="px-4 py-2 rounded-lg bg-[#C45B5B] text-white text-sm font-medium hover:bg-[#A34545] transition-colors">Yes, Logout</button>
                        <button onClick={() => setShowLogoutConfirm(false)}
                          className="px-4 py-2 rounded-lg border border-[#E8DFCF] text-[#77736B] text-sm font-medium hover:bg-[#FAF7F0] transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {user?.hasPassword !== false && <ChangePasswordCard />}
              <DeleteAccountCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
