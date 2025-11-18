export type UserRole = "FOUNDER" | "USER";

/**
 * Determines user role based on email address
 * 
 * @param email - User's email address
 * @returns "FOUNDER" if email matches FOUNDER_EMAIL env variable, otherwise "USER"
 */
export function getUserRoleFromEmail(email: string | null | undefined): UserRole {
  const founderEmail = process.env.FOUNDER_EMAIL;
  
  if (email && founderEmail && email.toLowerCase() === founderEmail.toLowerCase()) {
    return "FOUNDER";
  }
  
  return "USER";
}

