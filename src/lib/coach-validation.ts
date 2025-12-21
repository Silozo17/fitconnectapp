/**
 * Coach profile validation utilities
 * Identifies "real" coaches vs placeholder/test/incomplete profiles
 */

export interface CoachProfileFields {
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  card_image_url: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  location_country_code: string | null;
  location: string | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  verification_status?: string | null;
  is_verified?: boolean | null;
  is_complete_profile?: boolean | null;
}

export interface ProfileCompleteness {
  isComplete: boolean;
  score: number; // 0-100
  missingFields: string[];
  isBlocked: boolean; // True if name contains blocked pattern
}

// Patterns that indicate test/placeholder/admin accounts
const BLOCKED_NAME_PATTERNS = [
  'admin',
  'test',
  'demo',
  'example',
  'placeholder',
  'sample',
  'dummy',
];

// Minimum bio length for a complete profile
const MIN_BIO_LENGTH = 50;

/**
 * Checks if a coach's display name contains blocked patterns
 */
export function hasBlockedName(displayName: string | null): boolean {
  if (!displayName) return false;
  const nameLower = displayName.toLowerCase();
  return BLOCKED_NAME_PATTERNS.some(pattern => nameLower.includes(pattern));
}

/**
 * Determines if a coach profile meets "real coach" criteria
 * This should match the database computed column logic
 */
export function isRealCoach(coach: CoachProfileFields): boolean {
  // If the database has already computed this, use it
  if (coach.is_complete_profile !== undefined && coach.is_complete_profile !== null) {
    return coach.is_complete_profile;
  }
  
  // Display name must exist and not be a blocked pattern
  if (!coach.display_name || coach.display_name.trim() === '') return false;
  if (hasBlockedName(coach.display_name)) return false;
  
  // Bio must exist with minimum length
  if (!coach.bio || coach.bio.length < MIN_BIO_LENGTH) return false;
  
  // Must have profile image
  if (!coach.profile_image_url && !coach.card_image_url) return false;
  
  // Must have coach types
  if (!coach.coach_types || coach.coach_types.length === 0) return false;
  
  // Must have pricing
  if (!coach.hourly_rate || coach.hourly_rate <= 0) return false;
  
  // Must have session type
  if (!coach.online_available && !coach.in_person_available) return false;
  
  // Must have determinable location
  if (!coach.location_country_code && (!coach.location || coach.location.trim() === '')) return false;
  
  return true;
}

/**
 * Calculates detailed profile completeness with score and missing fields
 */
export function getProfileCompleteness(coach: CoachProfileFields): ProfileCompleteness {
  const missingFields: string[] = [];
  let score = 0;
  
  const weights = {
    display_name: 15,
    bio: 20,
    profile_image: 15,
    coach_types: 15,
    hourly_rate: 10,
    session_type: 10,
    location: 15,
  };
  
  const isBlocked = hasBlockedName(coach.display_name);
  
  // Check display name
  if (coach.display_name && coach.display_name.trim() !== '' && !isBlocked) {
    score += weights.display_name;
  } else {
    missingFields.push('display_name');
  }
  
  // Check bio
  if (coach.bio && coach.bio.length >= MIN_BIO_LENGTH) {
    score += weights.bio;
  } else {
    missingFields.push('bio');
  }
  
  // Check profile image
  if (coach.profile_image_url || coach.card_image_url) {
    score += weights.profile_image;
  } else {
    missingFields.push('profile_image');
  }
  
  // Check coach types
  if (coach.coach_types && coach.coach_types.length > 0) {
    score += weights.coach_types;
  } else {
    missingFields.push('coach_types');
  }
  
  // Check hourly rate
  if (coach.hourly_rate && coach.hourly_rate > 0) {
    score += weights.hourly_rate;
  } else {
    missingFields.push('hourly_rate');
  }
  
  // Check session type
  if (coach.online_available || coach.in_person_available) {
    score += weights.session_type;
  } else {
    missingFields.push('session_type');
  }
  
  // Check location
  if (coach.location_country_code || (coach.location && coach.location.trim() !== '')) {
    score += weights.location;
  } else {
    missingFields.push('location');
  }
  
  return {
    isComplete: score === 100 && !isBlocked,
    score,
    missingFields,
    isBlocked,
  };
}

/**
 * Profile completeness tier labels
 */
export type ProfileTier = 'complete' | 'incomplete' | 'placeholder';

/**
 * Gets the profile tier for display purposes
 */
export function getProfileTier(coach: CoachProfileFields): ProfileTier {
  if (hasBlockedName(coach.display_name)) {
    return 'placeholder';
  }
  
  const { isComplete } = getProfileCompleteness(coach);
  return isComplete ? 'complete' : 'incomplete';
}
