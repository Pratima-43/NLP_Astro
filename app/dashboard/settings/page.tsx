"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, Calendar, Clock, MapPin, Hand, Bell, Crown, LogOut, Save, Check, Upload, X, Eye } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user, premium, updateProfile, logout, palmImageUrl, setPalmImageUrl } = useApp();
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dob, setDob] = useState(user?.dateOfBirth || "");
  const [timeOfBirth, setTimeOfBirth] = useState(user?.timeOfBirth || "");
  const [place, setPlace] = useState(user?.placeOfBirth || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [timeUnknown, setTimeUnknown] = useState(user?.timeOfBirthUnknown || false);
  const [dominantHand, setDominantHand] = useState<"left" | "right">(user?.dominantHand || "right");

  // Notification toggles
  const [dailyHoroscope, setDailyHoroscope] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [newFeatures, setNewFeatures] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleSave = () => {
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      dateOfBirth: dob,
      timeOfBirth: timeUnknown ? "" : timeOfBirth,
      timeOfBirthUnknown: timeUnknown,
      placeOfBirth: place.trim(),
      gender: gender || undefined,
      dominantHand,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePalmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPalmImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      Object.keys(localStorage).filter((k) => k.startsWith("astroverse_")).forEach((k) => localStorage.removeItem(k));
    }
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
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Date of Birth</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-1">Time of Birth</label>
                  <input type="time" value={timeOfBirth} onChange={(e) => setTimeOfBirth(e.target.value)} disabled={timeUnknown}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525] disabled:opacity-50" />
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
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]">
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {activeSection === "palm" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-4">
              <h3 className="font-semibold text-[#252525]">Palm Image</h3>
              {palmImageUrl ? (
                <div className="relative w-fit">
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
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C6A15B] text-[#C6A15B] text-sm font-medium hover:bg-[#C6A15B]/5 transition-colors">
                <Upload className="w-4 h-4" /> {palmImageUrl ? "Replace" : "Upload"} Image
              </button>
              <input type="file" accept="image/*" onChange={handlePalmUpload} className="hidden" ref={fileRef} />
              <div>
                <p className="text-sm font-medium text-[#252525] mb-2">Dominant Hand</p>
                <div className="flex gap-2">
                  {(["left", "right"] as const).map((h) => (
                    <button key={h} onClick={() => setDominantHand(h)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        dominantHand === h ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#C6A15B]" : "border-[#E8DFCF] text-[#77736B]"
                      }`}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 space-y-4">
              <h3 className="font-semibold text-[#252525]">Notification Preferences</h3>
              {[
                { label: "Daily Horoscope", desc: "Receive your daily horoscope notification", value: dailyHoroscope, set: setDailyHoroscope },
                { label: "Weekly Summary", desc: "Get a weekly summary of your readings", value: weeklySummary, set: setWeeklySummary },
                { label: "New Features", desc: "Be notified about new platform features", value: newFeatures, set: setNewFeatures },
                { label: "Email Notifications", desc: "Receive notifications via email", value: emailNotifs, set: setEmailNotifs },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2 border-b border-[#E8DFCF] last:border-0">
                  <div><p className="text-sm font-medium text-[#252525]">{n.label}</p><p className="text-xs text-[#77736B]">{n.desc}</p></div>
                  <button onClick={() => n.set(!n.value)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${n.value ? "bg-[#C6A15B]" : "bg-[#E8DFCF]"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${n.value ? "left-5.5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
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
                <h3 className="font-semibold text-[#252525] mb-4">Account Actions</h3>
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
                  <button onClick={handleClearData}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E8DFCF] text-[#77736B] text-sm font-medium hover:bg-[#FAF7F0] transition-colors">
                    Clear Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
