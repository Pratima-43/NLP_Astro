import { pricingConfig } from '@/data/pricing';

export function validateCoupon(code: string): { valid: boolean; discount: number; message: string } {
  if (!code || !code.trim()) {
    return { valid: false, discount: 0, message: 'Please enter a coupon code' };
  }

  const normalized = code.trim().toUpperCase();
  const activeCoupon = pricingConfig.coupon;

  if (activeCoupon.isActive && normalized === activeCoupon.code.toUpperCase()) {
    return {
      valid: true,
      discount: activeCoupon.discountPercent,
      message: `Coupon applied! ${activeCoupon.discountPercent}% discount (${activeCoupon.description})`,
    };
  }

  return {
    valid: false,
    discount: 0,
    message: 'Invalid coupon code',
  };
}

export function calculateFinalPrice(
  basePrice: number,
  discountPercent: number
): { original: number; discount: number; final: number } {
  const original = Number(basePrice) || 0;
  const clampedDiscount = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discount = Math.round(((original * clampedDiscount) / 100) * 100) / 100;
  const final = Math.max(0, Math.round((original - discount) * 100) / 100);

  return {
    original,
    discount,
    final,
  };
}
