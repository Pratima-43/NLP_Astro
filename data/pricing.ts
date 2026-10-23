import { PricingConfig } from '@/types';

export const pricingConfig: PricingConfig = {
  standardPrice: 99,
  currency: 'USD',
  currencySymbol: '$',
  period: '1 Year',
  periodMonths: 12,
  features: [
    'Comprehensive Combined Report (Vedic Astrology + Numerology + Palmistry synthesis)',
    'Unlimited AI Astrologer Chatbot Consultations with contextual chart awareness',
    'Deep-dive Planetary Transits, Vimshottari Dasha, & Nakshatra analysis',
    'Cross-System Life Alignment, Synergy & Contradiction Resolution',
    'Downloadable Premium Astrological Dossier (PDF)',
    'Priority Support & Personalized Astrological Guidance',
  ],
  coupon: {
    code: 'ASTROFREE',
    discountPercent: 100,
    durationMonths: 12,
    isActive: true,
    description: 'Free premium access for 1 year',
  },
};
