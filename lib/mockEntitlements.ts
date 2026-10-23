import { PremiumEntitlement } from '@/types';

export function getDefaultEntitlement(): PremiumEntitlement {
  return {
    isActive: false,
    plan: 'Free Standard Tier',
  };
}

export function activatePremium(couponCode?: string): PremiumEntitlement {
  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(now.getFullYear() + 1);

  return {
    isActive: true,
    activatedAt: now.toISOString(),
    expiresAt: oneYearLater.toISOString(),
    couponUsed: couponCode ? couponCode.trim().toUpperCase() : undefined,
    plan: 'Premium Annual',
  };
}

export function isPremiumFeature(feature: string): boolean {
  if (!feature) return false;
  const normalized = feature.toLowerCase().trim();
  const premiumFeatures = [
    'combined-report',
    'combined_report',
    'combinedreport',
    'chatbot',
    'ai-chatbot',
    'pdf-download',
    'pdf_download',
    'pdfdownload',
  ];
  return premiumFeatures.includes(normalized);
}
