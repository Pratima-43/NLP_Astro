// The signed-in user, as returned by GET /api/v1/auth/me (backend/app/auth/accounts.py:user_payload).

export interface NotificationPrefs {
  reading_reminders: boolean;
  progress_updates: boolean;
  premium_offers: boolean;
  security_emails: boolean;
}

export interface PremiumEntitlement {
  isActive: boolean;
  plan: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  couponUsed?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  /** "YYYY-MM-DD", or "" when not given yet. */
  dateOfBirth: string;
  /** "HH:MM" (24-hour), or "" when unknown. */
  timeOfBirth: string;
  timeOfBirthUnknown: boolean;
  placeOfBirth: string;
  gender: string;
  dominantHand: "left" | "right";
  onboarded: boolean;
  authProvider: "local" | "supabase";
  hasPassword: boolean;
  notificationPrefs: NotificationPrefs;
  premium: PremiumEntitlement;
}

/** Fields the profile form can change (PUT /api/v1/auth/profile). */
export type ProfileUpdate = Partial<
  Pick<UserProfile, "name" | "dateOfBirth" | "timeOfBirth" | "timeOfBirthUnknown" | "placeOfBirth" | "dominantHand" | "onboarded" | "notificationPrefs">
>;
