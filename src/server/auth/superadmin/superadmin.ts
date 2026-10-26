/**
 * Superadmin status resolution
 */

import { serverEnv } from '../env';

const SUPERADMIN_EMAILS = serverEnv.superadminEmails;

/**
 * Check if an email is in the superadmin allowlist
 */
export function isSuperadminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return SUPERADMIN_EMAILS.includes(normalized);
}

/**
 * Get the superadmin allowlist (for internal use only)
 */
export function getSuperadminEmails(): string[] {
  return [...SUPERADMIN_EMAILS];
}

/**
 * Check if a user permissions object indicates superadmin
 */
export function isSuperadminUser(user: {
  role?: string;
  isSuperadmin?: boolean;
} | null): boolean {
  if (!user) return false;
  return user.isSuperadmin === true || user.role === 'platform_superadmin';
}

/**
 * Resolve superadmin status from verified email
 * Call after successful OTP verification
 */
export function resolveSuperadminStatus(email: string): boolean {
  return isSuperadminEmail(email);
}