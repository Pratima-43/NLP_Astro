// Response shapes of the AstroVerse FastAPI backend (backend/app/modules/*).

export type Polarity = "positive" | "neutral" | "challenge" | "negative" | string | null;
export type Confidence = "high" | "medium" | "low";
export type ModuleKey = "numerology" | "astrology" | "palmistry";

export interface CitedItem {
  text: string;
  record_ids: string[];
  title?: string;
}

// ── Numerology ────────────────────────────────────────────────
export type NumerologyComponent = "moolank" | "bhagyank" | "namank" | "personal_year";
export type EvidenceLayer = "compound_birth_date" | "component_specific" | "general_number" | "context_specific";

export interface NumerologyCalculation {
  number: number;
  planet: string | null;
  steps: string[];
  compound_number?: number | null;
  birth_day?: number;
  digit_sum?: number;
  normalized_name?: string;
  letter_values?: Array<{ letter: string; value: number }>;
  target_year?: number;
  reduced_day?: number;
  reduced_month?: number;
  reduced_target_year?: number;
}

export interface NumerologyRecord {
  record_id: string;
  number: number;
  compound_number: number | null;
  planet: string | null;
  numerology_component: string;
  context: string | null;
  category: string;
  trait: string;
  claim: string;
  polarity: Polarity;
  source_name: string;
  source_url: string | null;
  source_wording: string | null;
  verification_status: string;
  evidence_layer: EvidenceLayer;
}

export interface NumerologyInterpretation {
  headline: string;
  summary: string;
  strengths: CitedItem[];
  challenges: CitedItem[];
  key_themes: CitedItem[];
  explanation: { how_calculated: string; why_this_reading: string; evidence_notes: CitedItem[] };
  supporting_record_ids: string[];
  generation_status: string;
}

export interface NumerologySynthesis {
  headline?: string;
  overview?: string;
  resonances?: Array<CitedItem & { components: NumerologyComponent[] }>;
  tensions?: Array<CitedItem & { components: NumerologyComponent[] }>;
  year_focus?: CitedItem | null;
  generation_status: string;
}

export interface NumerologyReport {
  report_id: number;
  full_name: string;
  date_of_birth: string;
  target_year: number;
  context: string;
  components: Record<NumerologyComponent, NumerologyCalculation>;
  interpretations: Record<NumerologyComponent, NumerologyRecord[]>;
  generated_interpretations: Record<NumerologyComponent, NumerologyInterpretation>;
  synthesis: NumerologySynthesis;
  evidence_summary: Record<NumerologyComponent, Record<EvidenceLayer, number>>;
  disclaimer: string;
}

// ── Shared evidence (astrology & palmistry) ───────────────────
export interface EvidenceItem {
  evidence_id: string;
  record_id: string;
  feature_key: string;
  condition: string | null;
  theme: string;
  trait: string;
  claim: string;
  polarity: Polarity;
  source_name: string;
  source_url: string | null;
  source_wording: string | null;
  verification_status: string;
  basis: string;
  factor: string;
  weight: number;
}

export interface ReadingSection {
  key: string;
  title: string;
  text: string;
  evidence_ids: string[];
}

export interface Prediction {
  area: string;
  text: string;
  timing?: string;
  reasoning: string;
  confidence: Confidence;
  evidence_ids: string[];
}

export interface Reading {
  headline?: string;
  overview?: string;
  sections?: ReadingSection[];
  predictions?: Prediction[];
  current_period?: { text: string; evidence_ids: string[] } | null;
  generation_status: string;
}

// ── Vedic astrology ───────────────────────────────────────────
export interface Factor { factor: string; points: number }

export interface Nakshatra { index: number; name: string; lord: string; deity: string; symbol: string; pada: number }

export interface PlanetPlacement {
  name: string;
  longitude: number;
  sign: string;
  sign_sanskrit: string;
  sign_index: number;
  degree_label: string;
  house: number;
  retrograde: boolean;
  combust: boolean;
  dignity: string;
  nakshatra: Nakshatra;
  navamsa_sign: string;
  vargottama: boolean;
  sign_lord: string;
  houses_ruled: number[];
  strength: number;
  strength_factors: Factor[];
}

export interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  is_active: boolean;
  years?: number;
  antardashas?: DashaPeriod[];
}

export interface DomainOutlook {
  label: string;
  score: number;
  assessment: "strong" | "supportive" | "mixed" | "challenging";
  houses: number[];
  karakas: string[];
  factors: Factor[];
  activated_by_current_dasha: string[];
}

export interface VedicChart {
  birth: { local_datetime: string; timezone: string; utc_datetime: string; latitude: number; longitude: number; julian_day_ut: number; ayanamsa_lahiri: number };
  lagna: { sign: string; sign_sanskrit: string; sign_index: number; degree_label: string; lord: string; element: string; modality: string; nakshatra: Nakshatra };
  moon_sign: string;
  sun_sign: string;
  moon_paksha: string;
  planets: Record<string, PlanetPlacement>;
  houses: Array<{ house: number; name: string; sign: string; lord: string; occupants: string[] }>;
  yogas: Array<{ key: string; name: string; condition: string; planets: string[] }>;
  dasha: {
    moon_nakshatra: string;
    starting_lord: string;
    balance_at_birth_years: number;
    mahadashas: DashaPeriod[];
    current_period: { mahadasha: string; antardasha: string; antardasha_start: string; antardasha_end: string; mahadasha_end: string } | null;
  };
  transits: {
    as_of: string;
    saturn: { sign: string; house_from_moon: number; house_from_lagna: number };
    jupiter: { sign: string; house_from_moon: number; house_from_lagna: number };
    sade_sati: { active: boolean; phase: string | null; rule: string };
  };
  domains: Record<string, DomainOutlook>;
}

export interface AstrologyReading {
  chart_id: number;
  full_name: string;
  place_name: string | null;
  birth_time_unknown: boolean;
  chart: VedicChart;
  evidence: EvidenceItem[];
  interpretation: Reading;
  conventions: Record<string, string>;
  disclaimer: string;
}

export interface GeocodeResult { name: string; latitude: number; longitude: number; timezone: string }

// ── Palmistry ─────────────────────────────────────────────────
export interface PalmLine {
  key: string;
  name: string;
  color: string;
  detected: boolean;
  reason?: string;
  length_palm_widths?: number;
  mean_crease_response?: number;
  coverage?: number;
  depth?: string;
  sagitta_ratio?: number;
  curvature?: string;
  breaks?: number;
  start_uv?: [number, number];
  end_uv?: [number, number];
  confidence?: number;
  forked_end?: boolean;
}

export interface PalmMount {
  name: string;
  development: "prominent" | "average" | "flat" | "not_visible";
  index: number | null;
  brightness_z: number | null;
  line_density_z: number | null;
}

export interface PalmCondition {
  feature_key: string;
  condition: string | null;
  rule: string;
  measured: string;
  weight: number;
  label: string;
  record_ids: string[];
}

export interface PalmReading {
  reading_id: number;
  reused?: boolean;
  hand: "left" | "right";
  annotated_image?: string;
  analysis: {
    image: { width: number; height: number; sharpness: number };
    landmarks: Array<[number, number]>;
    pose: { handedness: string; handedness_score: number; palm_side: boolean };
    warnings: string[];
    lines: Record<string, PalmLine>;
    mounts: Record<string, PalmMount>;
    geometry: Record<string, string | number | Record<string, string>> & { element: string; rules: Record<string, string> };
    overlay: {
      lines: Array<{ key: string; name: string; color: string; detected: boolean; points: Array<[number, number]>; trace: Array<[number, number]> }>;
      mounts: Array<{ key: string; name: string; development: string; cx: number; cy: number; rx: number; ry: number }>;
    };
    detector: string;
    thresholds: Record<string, number>;
  };
  conditions: PalmCondition[];
  evidence: EvidenceItem[];
  interpretation: Reading;
  method: Record<string, string>;
  disclaimer: string;
}

// ── Integration ───────────────────────────────────────────────
export interface Contribution {
  module: ModuleKey;
  percent: number;
  cited_claims: number;
  available_claims: number;
  weight: number;
}

export interface IntegratedClaim {
  module: ModuleKey;
  trait: string;
  claim: string;
  basis: string;
  weight: number;
  source_name: string | null;
}

export type Relation = "agreement" | "partial_overlap" | "difference" | "contradiction" | "single_source";

export interface ChatAnswer {
  session_id: number;
  answer: string;
  key_points: Array<{ text: string; claim_ids: string[] }>;
  module_insights: Array<{ module: ModuleKey; summary: string; claim_ids: string[] }>;
  cross_system: Array<{ relation: Relation; text: string; claim_ids: string[] }>;
  follow_up_questions: string[];
  contributions: Contribution[];
  themes: string[];
  available_modules: Record<ModuleKey, boolean>;
  claims: Record<string, IntegratedClaim>;
  generation_status: string;
}

export interface CombinedReportResult {
  report_id?: number;
  headline: string;
  overview: string;
  themes: Array<{ theme: string; label: string; relation: Relation; synthesis: string; claim_ids: string[]; contributions: Contribution[] }>;
  strongest_agreements: Array<{ text: string; claim_ids: string[] }>;
  notable_tensions: Array<{ text: string; claim_ids: string[] }>;
  overall_contributions: Contribution[];
  available_modules: Record<ModuleKey, boolean>;
  claims: Record<string, IntegratedClaim>;
  method: string;
  generation_status: string;
}

export type IntegrationStatus = Record<ModuleKey, { available: boolean; reading_id: number | null; claims: number }>;
