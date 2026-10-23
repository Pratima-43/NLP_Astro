import { UserProfile } from '@/types';

export function getDefaultProfile(): UserProfile {
  return {
    id: 'user_pratima_001',
    name: 'Pratima',
    email: 'pratima@astroverse.com',
    dateOfBirth: '1998-08-15',
    timeOfBirth: '05:30',
    placeOfBirth: 'Jaipur, Rajasthan, India',
    gender: 'Female',
    dominantHand: 'right',
    palmImageUrl: '/images/palm_sample.jpg',
    profileImage: '/images/avatar_pratima.png',
    timeOfBirthUnknown: false,
  };
}

export function mockLogin(email: string, password?: string): UserProfile | null {
  if (!email || !email.includes('@')) {
    return null;
  }

  const defaultProfile = getDefaultProfile();
  return {
    ...defaultProfile,
    email: email.trim().toLowerCase(),
    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
  };
}

export function mockSignup(name: string, email: string, password?: string): UserProfile | null {
  if (!email || !email.includes('@') || !name || name.trim().length === 0) {
    return null;
  }

  return {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    dateOfBirth: '1998-08-15',
    timeOfBirth: '05:30',
    placeOfBirth: 'Jaipur, Rajasthan, India',
    gender: 'Female',
    dominantHand: 'right',
    timeOfBirthUnknown: false,
  };
}
