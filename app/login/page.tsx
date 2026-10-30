"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Hash,
  Star,
  Hand,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isOnboarded, login, signup } = useApp();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect directly to dashboard or onboarding
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(isOnboarded ? "/dashboard" : "/onboarding");
    }
  }, [isAuthenticated, isOnboarded, router]);

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};

    if (mode === "signup" && !name.trim()) {
      errs.name = "Full name is required";
    }

    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!email.includes("@")) {
      errs.email = "Please enter a valid email containing '@'";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (mode === "signup" && password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (mode === "signup" && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) {
      errs.password = "Use both letters and numbers";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    const result = mode === "login"
      ? await login(email.trim(), password)
      : await signup(name.trim(), email.trim(), password);
    if (!result.ok) {
      setErrors({ form: result.error });
      setIsSubmitting(false);
    }
    // On success the session effect above redirects to the dashboard or onboarding.
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] grid lg:grid-cols-[1fr_1.1fr] selection:bg-[#C6A15B] selection:text-white">
      {/* Brand panel (desktop) */}
      <aside className="hidden lg:flex relative overflow-hidden bg-[#171B2D] text-[#FAF7F0] flex-col justify-between p-12">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#C6A15B]/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full border border-dashed border-[#C6A15B]/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[290px] h-[290px] rounded-full border border-[#FAF7F0]/10" />
        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <span className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></span>
          <span className="text-xl font-extrabold tracking-tight">Astro<span className="text-[#C6A15B]">Verse</span></span>
        </Link>
        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold mb-3">Three traditions · one reading</p>
          <h2 className="text-4xl font-bold leading-tight">Your numbers, your stars and your hand, read together.</h2>
          <div className="mt-8 space-y-3">
            {[
              { icon: Hash, title: "Numerology", text: "Moolank, Bhagyank, Namank and Personal Year" },
              { icon: Star, title: "Vedic Astrology", text: "Sidereal chart, yogas and Vimshottari dashas" },
              { icon: Hand, title: "Palmistry", text: "Lines and mounts detected from your photo" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur">
                <span className="w-9 h-9 rounded-lg bg-[#C6A15B]/15 flex items-center justify-center"><Icon className="w-4 h-4 text-[#E8C77E]" /></span>
                <div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-[#FAF7F0]/60">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-[#FAF7F0]/50">Every prediction shows the source it came from and how it was calculated.</p>
      </aside>

      <div className="flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative star-field">
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#77736B] hover:text-[#C6A15B] transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8DFCF] relative overflow-hidden">
        {/* Subtle Decorative Gold Accent Top Bar */}
        <div className="h-2 w-full gold-gradient" />

        <div className="p-8 sm:p-10">
          {/* Logo at Top */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block group focus:outline-none">
              <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center text-white mx-auto mb-3 shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171B2D] tracking-tight">
                Astro<span className="text-[#C6A15B]">Verse</span>
              </h1>
            </Link>
            <p className="text-xs sm:text-sm text-[#77736B] mt-1.5 font-light">
              {mode === "login"
                ? "Sign in to access your cosmic matrix"
                : "Begin your personalized convergence journey"}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF7F0] rounded-xl border border-[#E8DFCF] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrors({});
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-[#171B2D] shadow-sm"
                  : "text-[#77736B] hover:text-[#171B2D]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrors({});
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-[#171B2D] shadow-sm"
                  : "text-[#77736B] hover:text-[#171B2D]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* General Form Error Alert */}
          {errors.form && (
            <div className="mb-5 p-3 rounded-xl bg-[#C45B5B]/10 border border-[#C45B5B]/30 text-xs text-[#C45B5B] font-medium leading-relaxed">
              {errors.form}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name Field (Sign Up mode only) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-[#171B2D] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                      errors.name
                        ? "border-[#C45B5B] focus:ring-[#C45B5B]"
                        : "border-[#E8DFCF] focus:ring-[#C6A15B] focus:border-[#C6A15B]"
                    } bg-[#FAF7F0]/40 text-[#252525] placeholder:text-[#77736B]/50 text-sm focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-[#C45B5B] font-medium">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#171B2D] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                    errors.email
                      ? "border-[#C45B5B] focus:ring-[#C45B5B]"
                      : "border-[#E8DFCF] focus:ring-[#C6A15B] focus:border-[#C6A15B]"
                  } bg-[#FAF7F0]/40 text-[#252525] placeholder:text-[#77736B]/50 text-sm focus:outline-none focus:ring-2 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[#C45B5B] font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#171B2D]"
                >
                  Password
                </label>
                {mode === "login" && (
                  <Link href="/forgot-password" className="text-[11px] text-[#77736B] hover:text-[#C6A15B]">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "8+ characters, letters and numbers" : "Your password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
                    errors.password
                      ? "border-[#C45B5B] focus:ring-[#C45B5B]"
                      : "border-[#E8DFCF] focus:ring-[#C6A15B] focus:border-[#C6A15B]"
                  } bg-[#FAF7F0]/40 text-[#252525] placeholder:text-[#77736B]/50 text-sm focus:outline-none focus:ring-2 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77736B] hover:text-[#171B2D] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#C45B5B] font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C6A15B] focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>
                    {mode === "login"
                      ? "Sign In to Your Chart"
                      : "Create Your Cosmic Account"}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Switcher Note */}
          <div className="mt-6 text-center text-xs text-[#77736B]">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                  }}
                  className="text-[#9E7938] font-semibold hover:underline focus:outline-none"
                >
                  Sign up free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrors({});
                  }}
                  className="text-[#9E7938] font-semibold hover:underline focus:outline-none"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#FAF7F0] px-6 py-3 border-t border-[#E8DFCF] text-center text-[11px] text-[#77736B]">
          Your account and readings are stored securely on the AstroVerse server. Passwords are never stored in plain text.
        </div>
      </div>
      </div>
    </div>
  );
}
