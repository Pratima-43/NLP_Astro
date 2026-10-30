"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Calendar, Clock, MapPin, User, Upload, Check, ArrowRight, ArrowLeft, Hand, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DateField, TimeField } from "@/components/ui/DateTimeFields";
import { ACCEPTED_IMAGE_TYPES, imageFileToDataUrl } from "@/lib/image";

const PLACE_SUGGESTIONS = [
  "Jaipur, India", "Mumbai, India", "Delhi, India", "Bangalore, India",
  "Chennai, India", "Kolkata, India", "New York, USA", "London, UK",
  "Tokyo, Japan", "Sydney, Australia", "Dubai, UAE", "Singapore",
];

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Location" },
  { id: 3, label: "Palm Image" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isOnboarded, completeOnboarding, setPalmImageUrl } = useApp();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Onboarding saves to the signed-in account; send visitors to sign in, and finished users onward.
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (isOnboarded && !saving) router.replace("/dashboard");
  }, [isAuthenticated, isOnboarded, saving, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState(user?.name || "");
  const [dob, setDob] = useState(user?.dateOfBirth || "");
  const [timeOfBirth, setTimeOfBirth] = useState(user?.timeOfBirth || "");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState(user?.placeOfBirth || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [palmPreview, setPalmPreview] = useState<string | null>(null);
  const [dominantHand, setDominantHand] = useState<"left" | "right">("right");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(PLACE_SUGGESTIONS);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!name.trim()) newErrors.name = "Full name is required";
      if (!dob) newErrors.dob = "Date of birth is required";
    }
    if (step === 2) {
      if (!place.trim()) newErrors.place = "Place of birth is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
      else handleComplete();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setSaveError("");
    const result = await completeOnboarding({
      name: name.trim(),
      dateOfBirth: dob,
      timeOfBirth: timeUnknown ? "" : timeOfBirth,
      timeOfBirthUnknown: timeUnknown,
      placeOfBirth: place.trim(),
      gender: gender || undefined,
      dominantHand: dominantHand,
    });
    if (!result.ok) {
      setSaving(false);
      setSaveError(result.error);
      return;
    }
    if (palmPreview) setPalmImageUrl(palmPreview);
    router.push("/dashboard");
  };

  const handlePalmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    try {
      setPalmPreview(await imageFileToDataUrl(file));
    } catch {
      // Unreadable image: keep the step optional and let the user pick another.
    }
  };

  const handlePlaceChange = (value: string) => {
    setPlace(value);
    const filtered = PLACE_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(value.length > 0 && filtered.length > 0);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#252525]">AstroVerse</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep > step.id
                      ? "bg-[#C6A15B] text-white"
                      : currentStep === step.id
                      ? "bg-[#C6A15B] text-white animate-pulse-gold"
                      : "bg-[#E8DFCF] text-[#77736B]"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs mt-1.5 ${currentStep >= step.id ? "text-[#C6A15B] font-medium" : "text-[#77736B]"}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${currentStep > step.id ? "bg-[#C6A15B]" : "bg-[#E8DFCF]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E8DFCF] shadow-sm p-6 sm:p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[#252525]">Basic Information</h2>
                <p className="text-sm text-[#77736B] mt-1">Your birth details help us generate accurate Vedic astrology readings and personalized predictions.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1.5">
                  <User className="w-4 h-4 inline mr-1.5 text-[#C6A15B]" />Full Name *
                </label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none transition-all text-[#252525] bg-white"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-[#C45B5B] text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1.5 text-[#C6A15B]" />Date of Birth *
                </label>
                <DateField value={dob} onChange={setDob} />
                {errors.dob && <p className="text-[#C45B5B] text-xs mt-1">{errors.dob}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1.5 text-[#C6A15B]" />Time of Birth
                </label>
                <TimeField value={timeOfBirth} onChange={setTimeOfBirth} disabled={timeUnknown} />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E8DFCF] text-[#C6A15B] focus:ring-[#C6A15B]" />
                  <span className="text-sm text-[#77736B]">I don&apos;t know my exact birth time</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[#252525]">Location & Details</h2>
                <p className="text-sm text-[#77736B] mt-1">Birth location is essential for calculating your ascendant and house positions.</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[#252525] mb-1.5">
                  <MapPin className="w-4 h-4 inline mr-1.5 text-[#C6A15B]" />Place of Birth *
                </label>
                <input
                  type="text" value={place}
                  onChange={(e) => handlePlaceChange(e.target.value)}
                  onFocus={() => place && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none transition-all text-[#252525] bg-white"
                  placeholder="Start typing a city..."
                />
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#E8DFCF] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                      <button key={s} onClick={() => { setPlace(s); setShowSuggestions(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#252525] hover:bg-[#FAF7F0] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {errors.place && <p className="text-[#C45B5B] text-xs mt-1">{errors.place}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1.5">Gender (optional)</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}
                  className="select-gold w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none transition-all text-[#252525] bg-white">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Palm */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-[#252525]">Palm Image (Optional)</h2>
                <p className="text-sm text-[#77736B] mt-1">Upload a clear image of your dominant hand for palmistry analysis. This step is optional.</p>
              </div>

              {palmPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                  <img src={palmPreview} alt="Palm preview" className="w-full h-64 object-cover rounded-xl border border-[#E8DFCF]" />
                  <button onClick={() => setPalmPreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <X className="w-4 h-4 text-[#C45B5B]" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#E8DFCF] rounded-xl cursor-pointer hover:border-[#C6A15B] hover:bg-[#C6A15B]/5 transition-all">
                  <Upload className="w-10 h-10 text-[#C6A15B] mb-2" />
                  <span className="text-sm font-medium text-[#252525]">Click to upload palm image</span>
                  <span className="text-xs text-[#77736B] mt-1">PNG, JPG up to 10MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePalmUpload} className="hidden" />
                </label>
              )}

              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">
                  <Hand className="w-4 h-4 inline mr-1.5 text-[#C6A15B]" />Dominant Hand
                </label>
                <div className="flex gap-3">
                  {(["left", "right"] as const).map((h) => (
                    <button key={h} onClick={() => setDominantHand(h)}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                        dominantHand === h
                          ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#C6A15B]"
                          : "border-[#E8DFCF] text-[#77736B] hover:border-[#C6A15B]/50"
                      }`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#77736B] bg-[#FAF7F0] p-3 rounded-lg">
                Since this is a demo, uploaded images are stored locally and not analyzed automatically. Future versions will include AI-powered palm line detection.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8DFCF]">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#77736B] hover:text-[#252525] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {saveError && <p role="alert" className="text-xs text-[#C45B5B] flex-1 text-center px-2">{saveError}</p>}
            <button onClick={handleNext} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-[#C6A15B] text-white hover:bg-[#9E7938] transition-colors shadow-sm disabled:opacity-60">
              {currentStep === 3 ? (saving ? "Saving…" : "Complete Setup") : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
