"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Check, Sparkles, ArrowRight, Shield, Gift, ArrowLeft, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { pricingConfig } from "@/data/pricing";
import { validateCoupon, calculateFinalPrice } from "@/lib/coupon";

export default function PricingPage() {
  const router = useRouter();
  const { premium, activatePremiumAccess, isAuthenticated } = useApp();
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<{ original: number; discount: number; final: number } | null>(null);
  const [activated, setActivated] = useState(false);

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponCode);
    setCouponResult(result);
    if (result.valid) {
      setPriceBreakdown(calculateFinalPrice(pricingConfig.standardPrice, result.discount));
    } else {
      setPriceBreakdown(null);
    }
  };

  const handleActivate = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    activatePremiumAccess(couponCode || undefined);
    setActivated(true);
  };

  if (activated) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E8DFCF] p-8 max-w-md text-center shadow-lg animate-fade-in">
          <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4 animate-pulse-gold">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#252525] mb-2">Premium Activated! 🎉</h2>
          <p className="text-sm text-[#77736B] mb-4">
            Your premium access is active until{" "}
            <span className="font-semibold text-[#C6A15B]">
              {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </p>
          <p className="text-sm text-[#77736B] mb-6">You now have access to Combined Reports and AI Chatbot.</p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C6A15B] text-white font-medium hover:bg-[#9E7938] transition-colors">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (premium.isActive) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E8DFCF] p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#4A7C59]/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-[#4A7C59]" />
          </div>
          <h2 className="text-xl font-bold text-[#252525] mb-2">Premium Already Active</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] font-semibold">Active</span>
          <div className="grid grid-cols-2 gap-3 mt-4 mb-6">
            <div className="p-3 bg-[#FAF7F0] rounded-lg text-left"><p className="text-xs text-[#77736B]">Plan</p><p className="text-sm font-semibold">{premium.plan}</p></div>
            <div className="p-3 bg-[#FAF7F0] rounded-lg text-left"><p className="text-xs text-[#77736B]">Expires</p><p className="text-sm font-semibold">{premium.expiresAt ? new Date(premium.expiresAt).toLocaleDateString() : "—"}</p></div>
          </div>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C6A15B] text-white font-medium hover:bg-[#9E7938] transition-colors">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 text-sm text-[#77736B] hover:text-[#252525] mb-6 self-start max-w-lg mx-auto w-full transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#252525]">AstroVerse</span>
          </div>
          <h1 className="text-2xl font-bold text-[#252525]">Unlock Premium Access</h1>
          <p className="text-sm text-[#77736B] mt-1">Get the complete AstroVerse experience</p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl border border-[#E8DFCF] overflow-hidden shadow-sm">
          <div className="h-1.5 gold-gradient" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#C6A15B]/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#C6A15B]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#252525]">Premium Annual</h2>
                <p className="text-xs text-[#77736B]">Full access for 1 year</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {priceBreakdown && couponResult?.valid ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl text-[#77736B] line-through">{pricingConfig.currencySymbol}{pricingConfig.standardPrice}</span>
                  <span className="text-4xl font-bold text-[#C6A15B]">{pricingConfig.currencySymbol}0</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] font-semibold">FREE</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#C6A15B]">{pricingConfig.currencySymbol}{pricingConfig.standardPrice}</span>
                  <span className="text-sm text-[#77736B]">/ {pricingConfig.period.toLowerCase()}</span>
                </div>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-6">
              {pricingConfig.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#252525]">
                  <Check className="w-4 h-4 text-[#4A7C59] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <div className="border-t border-[#E8DFCF] pt-5">
              {/* Coupon */}
              <label className="block text-sm font-medium text-[#252525] mb-2">Have a coupon code?</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-sm text-[#252525] uppercase"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} />
                <button onClick={handleApplyCoupon}
                  className="px-4 py-2.5 rounded-lg border border-[#C6A15B] text-[#C6A15B] text-sm font-medium hover:bg-[#C6A15B]/5 transition-colors">Apply</button>
              </div>

              {couponResult && (
                <p className={`text-xs mb-3 flex items-center gap-1 ${couponResult.valid ? "text-[#4A7C59]" : "text-[#C45B5B]"}`}>
                  {couponResult.valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {couponResult.message}
                </p>
              )}

              <p className="text-xs text-[#77736B] mb-4 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-[#C6A15B]" />
                Try coupon code <span className="font-mono font-bold text-[#C6A15B]">ASTROFREE</span> for free access
              </p>

              {/* Price breakdown */}
              {priceBreakdown && couponResult?.valid && (
                <div className="bg-[#FAF7F0] rounded-lg p-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#77736B]">Premium Annual Plan</span><span className="text-[#252525]">{pricingConfig.currencySymbol}{priceBreakdown.original.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[#4A7C59]"><span>Coupon Discount ({couponCode.toUpperCase()})</span><span>-{pricingConfig.currencySymbol}{priceBreakdown.discount.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold pt-2 border-t border-[#E8DFCF]"><span className="text-[#252525]">Total</span><span className="text-[#C6A15B]">{pricingConfig.currencySymbol}{priceBreakdown.final.toFixed(2)}</span></div>
                </div>
              )}

              {/* CTA */}
              <button onClick={handleActivate}
                className="w-full py-3 rounded-lg bg-[#C6A15B] text-white font-medium hover:bg-[#9E7938] transition-colors text-sm">
                {priceBreakdown && couponResult?.valid ? "Activate Free Access" : `Subscribe for ${pricingConfig.currencySymbol}${pricingConfig.standardPrice}/${pricingConfig.period.toLowerCase()}`}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-[#E8DFCF]">
              <span className="flex items-center gap-1 text-[10px] text-[#77736B]"><Shield className="w-3 h-3" /> Secure</span>
              <span className="flex items-center gap-1 text-[10px] text-[#77736B]"><Sparkles className="w-3 h-3" /> Instant Access</span>
              <span className="flex items-center gap-1 text-[10px] text-[#C6A15B] font-medium">Demo Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
