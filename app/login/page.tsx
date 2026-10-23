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
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === "login") {
        const success = login(email.trim(), password);
        if (success) {
          // Check storage for persisted onboarding status
          const wasOnboarded =
            typeof window !== "undefined" &&
            localStorage.getItem("astroverse_onboarded") === "true";
          router.push(wasOnboarded ? "/dashboard" : "/onboarding");
        } else {
          setErrors({ form: "Invalid login credentials. Please check your email." });
          setIsSubmitting(false);
        }
      } else {
        const success = signup(name.trim(), email.trim(), password);
        if (success) {
          router.push("/onboarding");
        } else {
          setErrors({ form: "Could not create account. Please verify all fields." });
          setIsSubmitting(false);
        }
      }
    } catch {
      setErrors({ form: "An unexpected error occurred. Please try again." });
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("seeker@astroverse.io");
    setPassword("cosmic123");
    if (mode === "signup") {
      setName("Aarav Sharma");
    }
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative star-field selection:bg-[#C6A15B] selection:text-white">
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#77736B] hover:text-[#C6A15B] transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Demo Fast Fill Button */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs text-[#9E7938] hover:text-[#C6A15B] underline underline-offset-2 transition-colors font-medium"
        >
          Fill Demo Credentials
        </button>
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
                    placeholder="e.g. Aarav Sharma"
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
                  placeholder="seeker@astroverse.io"
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
                  <span className="text-[11px] text-[#77736B] hover:text-[#C6A15B] cursor-pointer">
                    Forgot password?
                  </span>
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
                  placeholder="At least 6 characters"
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

        {/* Demo Helper Footer Bar */}
        <div className="bg-[#FAF7F0] px-6 py-3 border-t border-[#E8DFCF] text-center text-[11px] text-[#77736B]">
          Demo: Enter any valid email containing &lsquo;@&rsquo; and 6+ character password.
        </div>
      </div>
    </div>
  );
}
