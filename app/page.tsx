"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Star,
  Hash,
  Hand,
  FileBarChart,
  MessageCircle,
  ArrowRight,
  Check,
  ChevronRight,
  Zap,
  Users,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function LandingPage() {
  const { isAuthenticated, isOnboarded } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const destinationHref = isAuthenticated
    ? isOnboarded
      ? "/dashboard"
      : "/onboarding"
    : "/login";

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#252525] flex flex-col font-sans selection:bg-[#C6A15B] selection:text-white">
      {/* ── 1. Sticky Navigation Bar ────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8DFCF] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-white shadow-sm ring-1 ring-[#C6A15B]/30 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#171B2D]">
                  Astro<span className="text-[#C6A15B]">Verse</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#77736B] font-medium -mt-1 hidden sm:block">
                  Tri-System Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-[#252525] hover:text-[#C6A15B] transition-colors"
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-[#77736B] hover:text-[#C6A15B] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-[#77736B] hover:text-[#C6A15B] transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-[#77736B] hover:text-[#C6A15B] transition-colors"
              >
                Pricing
              </Link>
            </nav>

            {/* Desktop Auth CTA */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href={destinationHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[#252525] hover:text-[#C6A15B] px-3 py-2 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#171B2D] hover:text-[#C6A15B] hover:bg-white/60 border border-[#E8DFCF] focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8DFCF] bg-[#FAF7F0] px-4 pt-4 pb-6 space-y-3 animate-fade-in shadow-lg">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#252525] hover:bg-white hover:text-[#C6A15B]"
            >
              Home
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#77736B] hover:bg-white hover:text-[#C6A15B]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#77736B] hover:bg-white hover:text-[#C6A15B]"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#77736B] hover:bg-white hover:text-[#C6A15B]"
            >
              Pricing
            </Link>
            <div className="pt-4 border-t border-[#E8DFCF] flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  href={destinationHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-colors"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-[#252525] bg-white border border-[#E8DFCF]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section ────────────────────────────────────── */}
      <section className="relative bg-[#171B2D] text-white overflow-hidden py-24 sm:py-32 star-field border-b border-[#E8DFCF]/10">
        {/* Subtle Celestial Elements (CSS gradients & orbital rings) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Radial Gold Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#C6A15B]/10 rounded-full blur-3xl" />
          {/* Subtle Outer Orbital Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-[#C6A15B]/15 border-dashed" />
          {/* Inner Orbital Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-[#FAF7F0]/10" />
          {/* Celestial Planetary Accent Nodes */}
          <div className="absolute top-[28%] left-[24%] w-3 h-3 rounded-full bg-[#C6A15B] shadow-[0_0_12px_#C6A15B] opacity-80" />
          <div className="absolute bottom-[30%] right-[22%] w-2.5 h-2.5 rounded-full bg-[#D4B87A] shadow-[0_0_10px_#D4B87A] opacity-70" />
          <div className="absolute top-[65%] left-[18%] w-2 h-2 rounded-full bg-white/60 shadow-[0_0_8px_white] opacity-60" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#C6A15B]/15 text-[#D4B87A] border border-[#C6A15B]/30 mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>The Convergence of Ancient Metaphysics</span>
          </div>

          {/* Large Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Discover Your{" "}
            <span className="text-gold-gradient drop-shadow-sm">
              Cosmic Blueprint
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-[#FAF7F0]/85 mb-10 leading-relaxed font-light">
            Unlock personalized insights from the convergence of Vedic
            Astrology, Numerology, and Palmistry — powered by modern
            technology.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
            <Link
              href={destinationHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Free"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-[#FAF7F0] border border-[#C6A15B]/50 hover:bg-white/10 hover:border-[#C6A15B] transition-all duration-200 backdrop-blur-sm"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-[#C6A15B]" />
            </Link>
          </div>

          {/* Tri-System Badges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/20 flex items-center justify-center text-[#D4B87A]">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Vedic Astrology</div>
                <div className="text-[11px] text-[#FAF7F0]/60">Planetary & Dasha cycles</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/20 flex items-center justify-center text-[#D4B87A]">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Sacred Numerology</div>
                <div className="text-[11px] text-[#FAF7F0]/60">Life path & destiny matrix</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/20 flex items-center justify-center text-[#D4B87A]">
                <Hand className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Digital Palmistry</div>
                <div className="text-[11px] text-[#FAF7F0]/60">Major lines & mount analysis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Features Section ─────────────────────────────────── */}
      <section id="features" className="py-24 bg-[#FAF7F0] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-4">
              Integrated Metaphysics
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171B2D] tracking-tight mb-4">
              Three Ancient Systems, One Modern Platform
            </h2>
            <p className="text-base sm:text-lg text-[#77736B] leading-relaxed">
              Every tradition illuminates a distinct layer of your psychological
              makeup, life cycles, and physical tendencies. We bring them together
              in harmony.
            </p>
          </div>

          {/* Three Large Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Vedic Astrology */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8DFCF] shadow-sm hover:shadow-xl hover:border-[#C6A15B]/60 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* Icon in gold circle */}
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-center justify-center text-[#C6A15B] mb-6 shadow-sm group-hover:bg-[#C6A15B] group-hover:text-white transition-colors duration-300">
                  <Star className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-3">
                  Time & Cosmic Influences
                </div>
                <h3 className="text-2xl font-bold text-[#171B2D] mb-3">
                  Vedic Astrology
                </h3>
                <p className="text-sm text-[#77736B] leading-relaxed mb-6">
                  Calculates comprehensive natal birth charts, exact planetary
                  positions, ascendants, and house rulerships. Gain deep
                  visibility into your 120-year Vimshottari Mahadasha cycles and
                  daily transit horoscopes.
                </p>
              </div>

              <div className="pt-6 border-t border-[#FAF7F0] space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Precise Kundali & 12 House Placements</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Nakshatra & Pada Deconstruction</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Mahadasha & Antardasha Life Timelines</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Daily, Weekly & Monthly Forecasts</span>
                </div>
              </div>
            </div>

            {/* Card 2: Numerology */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8DFCF] shadow-sm hover:shadow-xl hover:border-[#C6A15B]/60 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* Icon in gold circle */}
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-center justify-center text-[#C6A15B] mb-6 shadow-sm group-hover:bg-[#C6A15B] group-hover:text-white transition-colors duration-300">
                  <Hash className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-3">
                  Vibrational Geometry
                </div>
                <h3 className="text-2xl font-bold text-[#171B2D] mb-3">
                  Sacred Numerology
                </h3>
                <p className="text-sm text-[#77736B] leading-relaxed mb-6">
                  Decode the vibrational geometry of your birth date and full
                  birth name. Discover your core Life Path, Destiny, Soul Urge,
                  and Personality numbers, alongside active Personal Year cycles
                  and relational compatibility.
                </p>
              </div>

              <div className="pt-6 border-t border-[#FAF7F0] space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Life Path & Destiny Vibration Matrix</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Soul Urge & Innermost Desires</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Current Personal Year & Epicycle Shifts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Lucky Frequencies & Name Alignment</span>
                </div>
              </div>
            </div>

            {/* Card 3: Palmistry */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8DFCF] shadow-sm hover:shadow-xl hover:border-[#C6A15B]/60 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* Icon in gold circle */}
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-center justify-center text-[#C6A15B] mb-6 shadow-sm group-hover:bg-[#C6A15B] group-hover:text-white transition-colors duration-300">
                  <Hand className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-3">
                  Physical Embodiment
                </div>
                <h3 className="text-2xl font-bold text-[#171B2D] mb-3">
                  Biometric Palmistry
                </h3>
                <p className="text-sm text-[#77736B] leading-relaxed mb-6">
                  Transform palm images into in-depth chirognomy reports. Inspect
                  the four primary lines (Heart, Head, Life, and Fate), planetary
                  mount elevations, elemental hand classifications, and finger
                  proportions.
                </p>
              </div>

              <div className="pt-6 border-t border-[#FAF7F0] space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Major Lines: Heart, Head, Life & Fate</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Planetary Mount Analysis (Jupiter, Venus, Sun)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Hand Archetype: Earth, Air, Fire, Water</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#252525] font-medium">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Dominant vs. Subconscious Hand Comparison</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Gold Divider */}
      <div className="flex items-center justify-center gap-3 py-6 bg-[#FAF7F0]">
        <div className="h-px w-24 bg-[#E8DFCF]" />
        <div className="w-2 h-2 rounded-full bg-[#C6A15B]" />
        <div className="h-px w-24 bg-[#E8DFCF]" />
      </div>

      {/* ── 4. Combined Report Preview ──────────────────────────── */}
      <section id="combined-report" className="py-20 bg-white border-y border-[#E8DFCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Narrative & Mini Indicators */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-4">
                <FileBarChart className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>The Flagship Innovation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171B2D] tracking-tight mb-5 leading-tight">
                Where All Three Systems Converge
              </h2>
              <p className="text-base sm:text-lg text-[#77736B] leading-relaxed mb-8">
                Traditional readings operate in silos. AstroVerse synthesizes
                your Vedic chart, numerological numbers, and palm contours into
                a single unified intelligence engine. We highlight where systems
                align in consensus, where they offer complementary context, and
                transparently analyze creative tensions.
              </p>

              {/* Three Mini Indicators */}
              <div className="space-y-4 mb-8">
                {/* Indicator 1 */}
                <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#171B2D]">
                      Cross-System Agreements
                    </h4>
                    <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                      When your 10th House Sun, Life Path 1, and strong Fate Line
                      all signal prominent leadership, your potential reaches
                      unambiguous certainty.
                    </p>
                  </div>
                </div>

                {/* Indicator 2 */}
                <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#C6A15B]/15 text-[#9E7938] flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#171B2D]">
                      Complementary Insights
                    </h4>
                    <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                      Astrology predicts the timing of life transitions, Numerology
                      clarifies internal motivation, and Palmistry highlights your
                      practical emotional stamina to carry it out.
                    </p>
                  </div>
                </div>

                {/* Indicator 3 */}
                <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#171B2D]/10 text-[#171B2D] flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#171B2D]">
                      Honest Disagreements
                    </h4>
                    <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                      Real growth lives in nuance. When your palm shows pragmatic
                      caution while your chart urges risk, we spotlight the
                      creative friction so you can calibrate consciously.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={destinationHref}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>View Sample Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Column: Visual Report Card Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-[#FAF7F0] rounded-2xl p-6 sm:p-8 border border-[#E8DFCF] shadow-lg relative">
                {/* Header of Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E8DFCF] mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-white">
                      <FileBarChart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#171B2D]">
                        Convergence Matrix
                      </div>
                      <div className="text-[10px] text-[#77736B]">
                        Natal + Numerology + Palm Data
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4A7C59]/15 text-[#4A7C59]">
                    92% Alignment
                  </span>
                </div>

                {/* Simulated Synthesis Blocks */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E8DFCF]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#171B2D]">
                        Career & Professional Calling
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#4A7C59] bg-[#4A7C59]/10 px-2 py-0.5 rounded">
                        Full Agreement
                      </span>
                    </div>
                    <p className="text-xs text-[#77736B] leading-relaxed">
                      10th House Sun in Aries correlates directly with Life Path 1
                      and a deep, unbroken vertical Fate Line reaching Saturn Mount.
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#FAF7F0] text-[10px] font-medium text-[#77736B]">
                      <span className="bg-[#FAF7F0] px-2 py-0.5 rounded text-[#252525]">
                        Astro: Aries 10H
                      </span>
                      <span className="bg-[#FAF7F0] px-2 py-0.5 rounded text-[#252525]">
                        Num: LP 1
                      </span>
                      <span className="bg-[#FAF7F0] px-2 py-0.5 rounded text-[#252525]">
                        Palm: Strong Fate
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E8DFCF]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#171B2D]">
                        Emotional Expression & Relationships
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#9E7938] bg-[#C6A15B]/15 px-2 py-0.5 rounded">
                        Complementary
                      </span>
                    </div>
                    <p className="text-xs text-[#77736B] leading-relaxed">
                      Moon in Cancer offers intuitive warmth, balanced by Soul Urge 7
                      seeking intellectual depth and a gently curved Heart Line.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E8DFCF]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#171B2D]">
                        Risk vs. Preservation Strategy
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#171B2D] bg-[#171B2D]/10 px-2 py-0.5 rounded">
                        Dynamic Tension
                      </span>
                    </div>
                    <p className="text-xs text-[#77736B] leading-relaxed">
                      Mars transit favors aggressive expansion, while Earth-shaped
                      palm favors deliberate, grounded pacing. Recommendation: staged rollouts.
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <span className="text-[11px] text-[#77736B] font-medium">
                    ✦ Complete cross-referenced analysis available in Premium Tier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. AI Chatbot Preview ───────────────────────────────── */}
      <section id="ai-guide" className="py-24 bg-[#171B2D] text-white star-field relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#D4B87A] bg-[#C6A15B]/20 border border-[#C6A15B]/30 mb-4">
              <MessageCircle className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span>Cosmic Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ask Your Cosmic Guide
            </h2>
            <p className="text-base sm:text-lg text-[#FAF7F0]/80 leading-relaxed">
              Have an astrology question? Your AI Guide knows your birth chart,
              active Mahadashas, numerology vibration, and palm lines intimately.
              Receive deep, personalized context 24/7.
            </p>
          </div>

          {/* Interactive Chat Mockup Card */}
          <div className="max-w-3xl mx-auto bg-[#232842] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    AstroVerse Oracle
                    <span className="w-2 h-2 rounded-full bg-[#4A7C59] animate-pulse" />
                  </div>
                  <div className="text-xs text-[#FAF7F0]/60">
                    Context: Vedic Kundali + Life Path 7 + Water Hand
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#D4B87A] font-medium bg-[#C6A15B]/15 px-3 py-1 rounded-full border border-[#C6A15B]/30">
                Active Guide
              </span>
            </div>

            {/* Chat Bubbles (3 Sample Q&A Exchanges) */}
            <div className="space-y-5 mb-8">
              {/* Question 1 */}
              <div className="flex flex-col items-end">
                <div className="bg-[#C6A15B] text-white text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  How does my current Rahu Mahadasha align with my Life Path 7?
                </div>
                <span className="text-[10px] text-[#FAF7F0]/50 mt-1 mr-1">You · 2m ago</span>
              </div>

              {/* Answer 1 */}
              <div className="flex flex-col items-start">
                <div className="bg-white/10 text-[#FAF7F0] text-xs sm:text-sm px-4 py-3.5 rounded-2xl rounded-tl-sm max-w-[90%] border border-white/10 leading-relaxed shadow-sm">
                  <span className="font-semibold text-[#D4B87A]">Oracle: </span>
                  Your Rahu dasha activates unconventional learning and sudden
                  expansions. When paired with your contemplative Life Path 7,
                  this isn&apos;t a time for superficial goals. It is your prime window
                  for mastering research, metaphysics, and frontier technology.
                  Guard against analytical over-isolation.
                </div>
                <span className="text-[10px] text-[#FAF7F0]/50 mt-1 ml-1">AI Guide · Just now</span>
              </div>

              {/* Question 2 */}
              <div className="flex flex-col items-end">
                <div className="bg-[#C6A15B] text-white text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  My Fate line deepens noticeably after age 32. What does this indicate?
                </div>
                <span className="text-[10px] text-[#FAF7F0]/50 mt-1 mr-1">You · 1m ago</span>
              </div>

              {/* Answer 2 */}
              <div className="flex flex-col items-start">
                <div className="bg-white/10 text-[#FAF7F0] text-xs sm:text-sm px-4 py-3.5 rounded-2xl rounded-tl-sm max-w-[90%] border border-white/10 leading-relaxed shadow-sm">
                  <span className="font-semibold text-[#D4B87A]">Oracle: </span>
                  A deepening Fate line at age 32 indicates sudden consolidation of
                  purpose. Intriguingly, your Jupiter dasha begins right at that mark,
                  which rules your 9th house of dharma. Both your palm and your chart
                  confirm you will transition from trial-and-error to commanding authority.
                </div>
                <span className="text-[10px] text-[#FAF7F0]/50 mt-1 ml-1">AI Guide · Just now</span>
              </div>

              {/* Question 3 */}
              <div className="flex flex-col items-end">
                <div className="bg-[#C6A15B] text-white text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  Which days are most auspicious for launching my new venture this month?
                </div>
                <span className="text-[10px] text-[#FAF7F0]/50 mt-1 mr-1">You · 30s ago</span>
              </div>

              {/* Answer 3 */}
              <div className="flex flex-col items-start">
                <div className="bg-white/10 text-[#FAF7F0] text-xs sm:text-sm px-4 py-3.5 rounded-2xl rounded-tl-sm max-w-[90%] border border-white/10 leading-relaxed shadow-sm">
                  <span className="font-semibold text-[#D4B87A]">Oracle: </span>
                  Thursday the 15th and Wednesday the 21st harmonize your Personal
                  Day 3 energy with the Waxing Moon entering your 10th house. These
                  dates offer maximum visibility and executive momentum.
                </div>
                <span className="text-[10px] text-[#FAF7F0]/50 mt-1 ml-1">AI Guide · Just now</span>
              </div>
            </div>

            {/* Chat Action Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <Link
                href={destinationHref}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>Try the Chatbot</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. How It Works Section ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[#FAF7F0] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-4">
              Step-by-Step Clarity
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171B2D] tracking-tight mb-4">
              How AstroVerse Works
            </h2>
            <p className="text-base sm:text-lg text-[#77736B] leading-relaxed">
              Three seamless steps from setup to deep, actionable metaphysical guidance.
            </p>
          </div>

          {/* 3 Step Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8DFCF] shadow-sm relative flex flex-col items-center text-center">
              {/* Numbered Circle */}
              <div className="w-14 h-14 rounded-full bg-[#C6A15B] text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-[#FAF7F0] shadow-md mb-6">
                1
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-center justify-center text-[#C6A15B] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#171B2D] mb-3">
                Create Your Profile
              </h3>
              <p className="text-sm text-[#77736B] leading-relaxed">
                Enter your birth details (date, exact time, and birthplace) and
                securely upload an image of your palm to initialize calculations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8DFCF] shadow-sm relative flex flex-col items-center text-center">
              {/* Numbered Circle */}
              <div className="w-14 h-14 rounded-full bg-[#C6A15B] text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-[#FAF7F0] shadow-md mb-6">
                2
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-center justify-center text-[#C6A15B] mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#171B2D] mb-3">
                Explore Your Readings
              </h3>
              <p className="text-sm text-[#77736B] leading-relaxed">
                Get personalized astrology, numerology, and palmistry insights
                computed with traditional rigor and modern algorithmic precision.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8DFCF] shadow-sm relative flex flex-col items-center text-center">
              {/* Numbered Circle */}
              <div className="w-14 h-14 rounded-full bg-[#C6A15B] text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-[#FAF7F0] shadow-md mb-6">
                3
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] flex items-center justify-center text-[#C6A15B] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#171B2D] mb-3">
                Unlock Combined Wisdom
              </h3>
              <p className="text-sm text-[#77736B] leading-relaxed">
                See where all three systems agree, explore nuanced tensions, and
                consult your contextual AI guide anytime for decisive clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Gold Divider */}
      <div className="flex items-center justify-center gap-3 py-4 bg-[#FAF7F0]">
        <div className="h-px w-24 bg-[#E8DFCF]" />
        <div className="w-2 h-2 rounded-full bg-[#C6A15B]" />
        <div className="h-px w-24 bg-[#E8DFCF]" />
      </div>

      {/* ── 7. Pricing Section ──────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-[#FAF7F0] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#9E7938] bg-white border border-[#E8DFCF] mb-4">
              Simple & Transparent
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171B2D] tracking-tight mb-4">
              Invest in Your Destiny
            </h2>
            <p className="text-base sm:text-lg text-[#77736B]">
              Unlock the full depth of convergence analysis and unlimited AI guidance.
            </p>
          </div>

          {/* Centered Single Pricing Card */}
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DFCF] shadow-xl relative overflow-hidden">
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 gold-gradient" />

            {/* Header */}
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#9E7938] bg-[#FAF7F0] border border-[#E8DFCF] mb-3">
                All-Inclusive Annual Membership
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171B2D]">
                Premium Access
              </h3>
              <p className="text-xs sm:text-sm text-[#77736B] mt-1">
                Complete metaphysical intelligence suite
              </p>
            </div>

            {/* Price */}
            <div className="text-center my-6 py-6 border-y border-[#FAF7F0]">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold text-[#C6A15B] tracking-tight">
                  $99
                </span>
                <span className="text-base text-[#77736B] font-medium">/ year</span>
              </div>
              <p className="text-xs text-[#77736B] mt-2">
                Unconditional annual access to all models and features.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-[#252525]">
                <div className="w-5 h-5 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Full Combined Report (Tri-System Convergence)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#252525]">
                <div className="w-5 h-5 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">AI Chatbot Access (24/7 Contextual Guidance)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#252525]">
                <div className="w-5 h-5 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Advanced Insights (Vimshottari Dashas & Nakshatras)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#252525]">
                <div className="w-5 h-5 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">PDF Downloads of Every Reading &amp; Report</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#252525]">
                <div className="w-5 h-5 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Source Evidence Behind Every Prediction</span>
              </li>
            </ul>

            {/* Promotional Banner */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8DFCF] mb-8 text-center">
              <p className="text-xs sm:text-sm font-semibold text-[#9E7938]">
                🎉 Use coupon <span className="font-mono text-[#171B2D] bg-white px-2 py-0.5 rounded border border-[#E8DFCF]">ASTROFREE</span> for free access!
              </p>
              <p className="text-[11px] text-[#77736B] mt-1">
                Enter code during checkout or in dashboard settings.
              </p>
            </div>

            {/* CTA */}
            <Link
              href={destinationHref}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#C6A15B] hover:bg-[#9E7938] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Get Started"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-center text-[11px] text-[#77736B] mt-4">
              Demo environment. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. Footer ───────────────────────────────────────────── */}
      <footer className="bg-[#171B2D] text-[#FAF7F0] pt-16 pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Logo and Tagline (Col 1 & 2) */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Astro<span className="text-[#C6A15B]">Verse</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-[#FAF7F0]/70 max-w-sm leading-relaxed">
                The premier convergence platform uniting Vedic Astrology,
                Sacred Numerology, and Computer-Vision Palmistry into one
                coherent personal guidance system.
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs text-[#D4B87A]">
                <Shield className="w-4 h-4" />
                <span>Privacy-first · Palm photos never stored</span>
              </div>
            </div>

            {/* Links Column 1: Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4B87A] mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs text-[#FAF7F0]/75">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#combined-report" className="hover:text-white transition-colors">
                    Combined Report
                  </Link>
                </li>
                <li>
                  <Link href="#ai-guide" className="hover:text-white transition-colors">
                    AI Cosmic Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4B87A] mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs text-[#FAF7F0]/75">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/about#research" className="hover:text-white transition-colors">
                    Research
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4B87A] mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs text-[#FAF7F0]/75">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy#security" className="hover:text-white transition-colors">
                    Security Disclosure
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Disclaimer Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#FAF7F0]/60">
            <div>
              © 2024 AstroVerse. All rights reserved.
            </div>
            <div className="text-[11px] text-[#FAF7F0]/50 max-w-md">
              This is a demonstration platform. All predictions use sample data.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
