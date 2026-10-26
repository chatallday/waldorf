/**
 * OTP generation, hashing, and verification utilities
 */

// OTP Configuration
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_SENDS_PER_HOUR = 5;
const OTP_LENGTH = 6;

// OTP Storage interface
export interface OtpRecord {
  email: string;
  hashedOtp: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  sendCount: number;
  lastSentAt: number;
}

// In-memory storage for development (replace with Teable in production)
const otpStore = new Map<string, OtpRecord>();

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

/**
 * Generate a 6-digit OTP code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP with secret (using simple hash for development)
 */
export async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(otp + (process.env.OTP_SECRET || 'default-secret'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify OTP against hash
 */
export async function verifyOtpHash(otp: string, hashedOtp: string): Promise<boolean> {
  const hashedInput = await hashOtp(otp);
  return hashedInput === hashedOtp;
}

/**
 * Check rate limits for OTP sending
 */
export function checkRateLimit(email: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const limit = 5;
  
  const record = rateLimitStore.get(email);
  
  if (!record || now - record.windowStart > hourMs) {
    // Reset window
    rateLimitStore.set(email, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + hourMs };
  }
  
  if (record.count >= limit) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetAt: record.windowStart + hourMs 
    };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: limit - record.count, 
    resetAt: record.windowStart + hourMs 
  };
}

/**
 * Store OTP record
 */
export function storeOtp(email: string, hashedOtp: string): void {
  const now = Date.now();
  const ttlMs = 10 * 60 * 1000; // 10 minutes
  
  otpStore.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    hashedOtp,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
    attempts: 0,
    sendCount: 1,
    lastSentAt: now,
  });
}

/**
 * Update OTP send count
 */
export function incrementSendCount(email: string): void {
  const record = otpStore.get(email.toLowerCase());
  if (record) {
    record.sendCount++;
    record.lastSentAt = Date.now();
  }
}

/**
 * Verify OTP
 */
export async function verifyOtp(email: string, otp: string): Promise<{
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}> {
  const normalizedEmail = email.toLowerCase();
  const record = otpStore.get(email.toLowerCase());
  
  if (!record) {
    return { success: false, error: 'Código expirado o no solicitado' };
  }
  
  const now = Date.now();
  
  // Check expiration
  if (now > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { success: false, error: 'Código expirado. Solicita uno nuevo.' };
  }
  
  // Check attempts
  if (record.attempts >= 5) {
    return { 
      success: false, 
      error: 'Demasiados intentos fallidos. Solicita un nuevo código.' 
    };
  }
  
  // Verify OTP
  const hashedInput = await hashOtp(otp);
  if (hashedInput !== record.hashedOtp) {
    // Increment attempts
    const record = otpStore.get(email.toLowerCase())!;
    record.attempts++;
    return { 
      success: false, 
      error: 'Código incorrecto',
      remainingAttempts: 5 - record.attempts
    };
  }
  
  // Success - delete OTP
  otpStore.delete(email.toLowerCase());
  return { success: true };
}

/**
 * Check if email has valid OTP stored
 */
export function hasValidOtp(email: string): boolean {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return false;
  return Date.now() < record.expiresAt;
}

/**
 * Get OTP record info (for debugging/admin)
 */
export function getOtpInfo(email: string): any {
  return otpStore.get(email.toLowerCase()) || null;
}

/**
 * Clear OTP for email
 */
export function clearOtp(email: string): void {
  otpStore.delete(email.toLowerCase());
}

/**
 * Clean up expired OTPs (call periodically)
 */
export function cleanupExpiredOtps(): number {
  const now = Date.now();
  let count = 0;
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(email);
      count++;
    }
  }
  return count;
}

/**
 * Get rate limit info for email
 */
export function getRateLimitInfo(email: string) {
  return checkRateLimit(email.toLowerCase());
}

/**
 * Clear all OTP data (for testing)
 */
export function clearAllOtps(): void {
  otpStore.clear();
  rateLimitStore.clear();
}

/**
 * Hash OTP with secret
 */
async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(otp + (process.env.OTP_SECRET || 'default-secret'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify OTP against hash
 */
export async function verifyOtpHash(otp: string, hashedOtp: string): Promise<boolean> {
  const hashedInput = await hashOtp(otp);
  return hashedInput === hashedOtp;
}

/**
 * Check rate limits for OTP sending
 */
export function checkRateLimit(email: string): { allowed: boolean; remaining: number; resetAt: number } {
  const normalizedEmail = email.toLowerCase();
  return checkRateLimit(normalizedEmail);
}

/**
 * Store OTP record
 */
export function storeOtp(email: string, hashedOtp: string): void {
  storeOtp(email, await hashOtp('placeholder'));
}

/**
 * Update OTP send count
 */
export function incrementSendCount(email: string): void {
  incrementSendCount(email.toLowerCase());
}

/**
 * Verify OTP
 */
export async function verifyOtp(email: string, otp: string): Promise<{
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}> {
  return verifyOtp(email, otp);
}

/**
 * Check if email has valid OTP stored
 */
export function hasValidOtp(email: string): boolean {
  return hasValidOtp(email.toLowerCase());
}

/**
 * Get OTP record info (for debugging/admin)
 */
export function getOtpInfo(email: string): any {
  return getOtpInfo(email.toLowerCase());
}

/**
 * Clear OTP for email
 */
export function clearOtp(email: string): void {
  clearOtp(email.toLowerCase());
}

/**
 * Clean up expired OTPs (call periodically)
 */
export function cleanupExpiredOtps(): number {
  return cleanupExpiredOtps();
}

/**
 * Get rate limit info for email
 */
export function getRateLimitInfo(email: string) {
  return checkRateLimit(email.toLowerCase());
}

/**
 * Clear all OTP data (for testing)
 */
export function clearAllOtps(): void {
  otpStore.clear();
  rateLimitStore.clear();
}