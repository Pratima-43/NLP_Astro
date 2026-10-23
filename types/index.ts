// ============================================================
// AstroVerse — Core Type Definitions
// These interfaces define the shape of all data in the app.
// In production, validated calculation modules from Harshita's
// team will populate these structures. For now, mock data is used.
// ============================================================

// ── User ──────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  gender?: string;
  palmImageUrl?: string;
  dominantHand?: "left" | "right";
  profileImage?: string;
  timeOfBirthUnknown?: boolean;
}

// ── Astrology ─────────────────────────────────────────────────
export interface ZodiacSign {
  name: string;
  symbol: string;
  element: string;
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  degree: string;
  retrograde: boolean;
}

export interface HouseInfo {
  number: number;
  sign: string;
  significance: string;
  planets: string[];
}

export interface NakshatraInfo {
  name: string;
  lord: string;
  pada: number;
  deity: string;
  description: string;
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
}

export interface HoroscopePrediction {
  period: "daily" | "weekly" | "monthly";
  sign: string;
  prediction: string;
  luckyNumber: number;
  luckyColor: string;
  rating: number; // 1-5
}

export interface AstrologyResult {
  zodiacSign: ZodiacSign;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  planetPositions: PlanetPosition[];
  houses: HouseInfo[];
  nakshatra: NakshatraInfo;
  dashaOverview: DashaPeriod[];
  horoscope: {
    daily: HoroscopePrediction;
    weekly: HoroscopePrediction;
    monthly: HoroscopePrediction;
  };
  careerInsights: InsightItem[];
  relationshipInsights: InsightItem[];
  generalInsights: InsightItem[];
}

export interface InsightItem {
  title: string;
  description: string;
  icon?: string;
}

// ── Numerology ────────────────────────────────────────────────
export interface NumerologyNumber {
  type: string;
  value: number;
  meaning: string;
  strengths: string[];
  challenges: string[];
  description: string;
  careerThemes?: string[];
}

export interface NameNumerology {
  name: string;
  value: number;
  interpretation: string;
}

export interface CompatibilityResult {
  description: string;
  compatibleNumbers: number[];
  challengingNumbers: number[];
}

export interface NumerologyResult {
  lifePathNumber: NumerologyNumber;
  destinyNumber: NumerologyNumber;
  soulUrgeNumber: NumerologyNumber;
  personalityNumber: NumerologyNumber;
  birthdayNumber: NumerologyNumber;
  personalYearNumber: NumerologyNumber;
  nameNumerology: NameNumerology;
  compatibility: CompatibilityResult;
  luckyNumbers: number[];
  generalReport: string;
}

// ── Palmistry ─────────────────────────────────────────────────
export interface PalmLine {
  name: string;
  description: string;
  interpretation: string;
  length: string;
  depth: string;
  characteristics: string[];
}

export interface PalmMount {
  name: string;
  location: string;
  significance: string;
  reading: string;
}

export interface HandShape {
  type: string;
  element: string;
  description: string;
  traits: string[];
}

export interface FingerAnalysis {
  finger: string;
  trait: string;
  reading: string;
}

export interface PalmistryResult {
  heartLine: PalmLine;
  headLine: PalmLine;
  lifeLine: PalmLine;
  fateLine: PalmLine;
  mounts: PalmMount[];
  handShape: HandShape;
  fingerAnalysis: FingerAnalysis[];
  careerTendencies: string[];
  personalTendencies: string[];
  generalReport: string;
}

// ── Combined Report ───────────────────────────────────────────
export type ReportSourceSystem = "astrology" | "numerology" | "palmistry";

export interface ReportSection {
  title: string;
  content: string;
  sources: ReportSourceSystem[];
  type: "agreement" | "complementary" | "conflicting" | "individual";
}

export interface CombinedReportResult {
  overview: string;
  profileSummary: string;
  astrologyFindings: string[];
  numerologyFindings: string[];
  palmistryFindings: string[];
  agreements: ReportSection[];
  complementary: ReportSection[];
  conflicts: ReportSection[];
  careerOverview: ReportSection;
  relationshipOverview: ReportSection;
  personalGrowth: ReportSection;
  generalGuidance: ReportSection;
  summary: string;
}

// ── Chatbot ───────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// ── Pricing & Entitlements ────────────────────────────────────
export interface CouponConfig {
  code: string;
  discountPercent: number;
  durationMonths: number;
  isActive: boolean;
  description: string;
}

export interface PricingConfig {
  standardPrice: number;
  currency: string;
  currencySymbol: string;
  period: string;
  periodMonths: number;
  features: string[];
  coupon: CouponConfig;
}

export interface PremiumEntitlement {
  isActive: boolean;
  activatedAt?: string;
  expiresAt?: string;
  couponUsed?: string;
  plan: string;
}

// ── Navigation ────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// ── Daily Overview ────────────────────────────────────────────
export interface DailyOverview {
  luckyNumber: number;
  luckyColor: string;
  dailyTheme: string;
  suggestedFocus: string;
  astrologicalInsight: string;
  personalGuidance: string;
}
