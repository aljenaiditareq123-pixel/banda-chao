import { FOUNDER_EMAIL } from '../config/env';

export type UserRole = "FOUNDER" | "USER";

/**
 * Determines user role based on email address
 * 
 * @param email - User's email address
 * @returns "FOUNDER" if email matches FOUNDER_EMAIL env variable, otherwise "USER"
 */
export function getUserRoleFromEmail(email: string | null | undefined): UserRole {
  if (email && FOUNDER_EMAIL && email.toLowerCase() === FOUNDER_EMAIL.toLowerCase()) {
    return "FOUNDER";
  }
  
  return "USER";
}

/**
 * Checks if an email belongs to the founder
 * 
 * @param email - User's email address
 * @returns true if email matches FOUNDER_EMAIL, false otherwise
 */
export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email || !FOUNDER_EMAIL) {
    return false;
  }
  return email.toLowerCase() === FOUNDER_EMAIL.toLowerCase();
}

