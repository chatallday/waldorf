/**
 * Server-side environment validation and configuration.
 * All secrets must be set in Vercel server environment variables.
 * Never expose these to the client.
 */

export interface ServerEnvConfig {
  // Teable
  teableApiBase: string;
  teableBaseId: string;
  teableApiKey: string;

  // Auth
  otpSecret: string;
  authSecret: string;
  sessionSecret: string;
  superadminEmails: string[];
  authMockMode: boolean;

  // Resend (optional for Phase 1B)
  resendApiKey?: string;
  emailFrom?: string;
  emailReplyTo?: string;

  // Internal
  internalHealthcheckSecret?: string;
  rateLimitSecret?: string;

  // Environment
  nodeEnv: 'development' | 'production' | 'test';
}

/**
 * Get server environment variable with validation.
 * Throws if required variable is missing in production.
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value === '') {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    // In development, return placeholder to allow local testing
    return `dev-placeholder-${key}`;
  }
  return value;
}

function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value || value === '') {
    return undefined;
  }
  return value;
}

function parseSuperadminEmails(raw: string): string[] {
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Build config with validation
export const serverEnv: ServerEnvConfig = {
  // Teable
  teableApiBase: getRequiredEnv('TEABLE_API_BASE') || 'https://app.teable.ai/api',
  teableBaseId: getRequiredEnv('TEABLE_BASE_ID') || 'bseeZUvNX8unS2KrzOE',
  teableApiKey: getRequiredEnv('TEABLE_API_KEY'),

  // Auth
  otpSecret: getRequiredEnv('OTP_SECRET'),
  authSecret: getRequiredEnv('AUTH_SECRET'),
  sessionSecret: getRequiredEnv('SESSION_SECRET'),
  superadminEmails: parseSuperadminEmails(
    getRequiredEnv('SUPERADMIN_EMAILS') || 'mike@dynamicmike.com,dynamicmike@gmail.com'
  ),
  authMockMode: getOptionalEnv('AUTH_MOCK_MODE') === 'true',

  // Resend (optional for Phase 1B)
  resendApiKey: getOptionalEnv('RESEND_API_KEY'),
  emailFrom: getOptionalEnv('EMAIL_FROM'),
  emailReplyTo: getOptionalEnv('EMAIL_REPLY_TO'),

  // Internal
  internalHealthcheckSecret: getOptionalEnv('INTERNAL_HEALTHCHECK_SECRET'),
  rateLimitSecret: getOptionalEnv('RATE_LIMIT_SECRET'),

  // Environment
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
};

function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value || value === '') {
    return undefined;
  }
  return value;
}

function parseSuperadminEmails(raw: string): string[] {
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Validate that all required configuration is present.
 * Throws if critical configuration is missing in production.
 */
export function validateServerConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const isProduction = serverEnv.nodeEnv === 'production';

  if (!serverEnv.teableApiKey || serverEnv.teableApiKey.startsWith('dev-placeholder-')) {
    errors.push('TEABLE_API_KEY not configured');
  }

  if (!serverEnv.teableBaseId || serverEnv.teableBaseId.startsWith('dev-placeholder-')) {
    errors.push('TEABLE_BASE_ID not configured');
  }

  if (!serverEnv.otpSecret || serverEnv.otpSecret.startsWith('dev-placeholder-')) {
    errors.push('OTP_SECRET not configured');
  }

  if (!serverEnv.authSecret || serverEnv.authSecret.startsWith('dev-placeholder-')) {
    errors.push('AUTH_SECRET not configured');
  }

  if (!serverEnv.sessionSecret || serverEnv.sessionSecret.startsWith('dev-placeholder-')) {
    errors.push('SESSION_SECRET not configured');
  }

  if (serverEnv.superadminEmails.length === 0) {
    errors.push('SUPERADMIN_EMAILS not configured');
  }

  if (isProduction && serverEnv.authMockMode) {
    errors.push('AUTH_MOCK_MODE must be false in production');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isProduction(): boolean {
  return serverEnv.nodeEnv === 'production';
}

export function isDevelopment(): boolean {
  return serverEnv.nodeEnv === 'development';
}

export { serverEnv };