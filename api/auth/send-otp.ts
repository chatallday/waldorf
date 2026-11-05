// OTP send endpoint - Self-contained implementation
import { Resend } from 'resend';

// Simple email validation
function validateEmail(email: string): { valid: boolean; normalized?: string; error?: string } {
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true, normalized };
}

// OTP Configuration
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_SENDS_PER_HOUR = 5;

// In-memory storage for development (replace with Teable in production)
const otpStore = new Map<string, any>();
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOtp(otp: string): Promise<string> {
  const data = new TextEncoder().encode(otp + (process.env.OTP_SECRET || 'default-secret'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkRateLimit(email: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const limit = 5;
  
  const record = rateLimitStore.get(email);
  
  if (!record || now - record.windowStart > hourMs) {
    rateLimitStore.set(email, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + hourMs };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.windowStart + hourMs };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.windowStart + hourMs };
}

async function storeOtp(email: string, hashedOtp: string): Promise<void> {
  const now = Date.now();
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

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const logger = {
  withRequest: (id: string) => ({
    info: (msg: string, data?: any) => console.log(`[INFO][${id}]`, msg, data),
    warn: (msg: string, data?: any) => console.warn(`[WARN][${id}]`, msg, data),
    error: (msg: string, data?: any) => console.error(`[ERROR][${id}]`, msg, data),
  }),
  info: (msg: string, data?: any) => console.log('[INFO]', msg, data),
  warn: (msg: string, data?: any) => console.warn('[WARN]', msg, data),
  error: (msg: string, data?: any) => console.error('[ERROR]', msg, data),
};

// Create OTP challenge in Teable (simplified - just store locally for now)
async function createOtpChallenge(email: string, otp: string, correlationId: string): Promise<{ success: boolean }> {
  // In production, this would create a record in Teable
  // For now, we just store locally
  const hashedOtp = await hashOtp(otp);
  await storeOtp(email, hashedOtp);
  return { success: true };
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@thewaldorfpath.com';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@thewaldorfpath.com';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const log = logger.withRequest(requestId);
  
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object' || !body.email) {
      return Response.json(
        { success: false, error: 'AUTH_INVALID_EMAIL', message: 'Email is required' },
        { status: 400 }
      );
    }

    const { valid, normalized, error: emailError } = validateEmail(body.email);
    if (!valid) {
      return Response.json(
        { success: false, error: 'AUTH_INVALID_EMAIL', message: emailError },
        { status: 400 }
      );
    }

    const email = normalized!;
    const language = (body.language === 'en') ? 'en' : 'es';

    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      log.warn('OTP send rate limited', { email, resetAt: rateLimit.resetAt });
      return Response.json(
        {
          success: false,
          error: 'AUTH_RATE_LIMITED',
          message: `Too many codes sent. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 60000)} minutes.`,
        },
        { status: 429 }
      );
    }

    log.info('Sending OTP', { email });

    if (!resend) {
      log.error('Resend not configured');
      return Response.json(
        { success: false, error: 'AUTH_EMAIL_NOT_CONFIGURED', message: 'Email service not configured' },
        { status: 503 }
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    // Create OTP challenge in Teable
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await createOtpChallenge(email, otp, correlationId);

    // Send email via Resend
    const isEs = language === 'es';
    const subject = isEs
      ? `Tu código de acceso: ${otp}`
      : `Your access code: ${otp}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 9999px; display: inline-block; margin-bottom: 16px;">
            <span style="color: #fef3c7; font-weight: 600; font-size: 14px;">${isEs ? 'Código de acceso' : 'Access Code'}</span>
          </div>
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">${otp}</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">${isEs ? 'Este código expira en 10 minutos' : 'This code expires in 10 minutes'}</p>
        </div>
        <div style="padding: 32px 24px; background: #fafafa; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">${isEs ? 'Ingresa este código en The Waldorf Path para acceder a tu cuenta.' : 'Enter this code in The Waldorf Path to access your account.'}</p>
          <div style="background: #f0fdfa; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #065f46; font-weight: 600;">${isEs ? 'Seguridad' : 'Security'}</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #047857;">
              <li>${isEs ? 'Nunca compartas este código con nadie' : 'Never share this code with anyone'}</li>
              <li>${isEs ? 'El equipo de The Waldorf Path nunca te pedirá este código' : 'The The Waldorf Path team will never ask for this code'}</li>
              <li>${isEs ? 'El código expira en 10 minutos' : 'Code expires in 10 minutes'}</li>
            </ul>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 16px; text-align: center;">
            ${isEs ? 'Si no solicitaste este código, ignora este correo.' : 'If you didn\'t request this code, please ignore this email.'}
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0; text-align: center;">
            © 2025 The Waldorf Path. ${isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
${isEs ? 'Tu código de acceso a The Waldorf Path' : 'Your The Waldorf Path access code'}

${otp}

${isEs ? 'Este código expira en 10 minutos.' : 'This code expires in 10 minutes.'}

${isEs ? 'Ingresa este código en The Waldorf Path para acceder a tu cuenta.' : 'Enter this code in The Waldorf Path to access your account.'}

${isEs ? 'Seguridad:' : 'Security:'}
- ${isEs ? 'Nunca compartas este código con nadie' : 'Never share this code with anyone'}
- ${isEs ? 'El equipo de The Waldorf Path nunca te pedirá este código' : 'The The Waldorf Path team will never ask for this code'}
- ${isEs ? 'El código expira en 10 minutos' : 'Code expires in 10 minutes'}

---
${isEs ? 'Si no solicitaste este código, ignora este correo.' : 'If you didn\'t request this code, please ignore this email.'}

© 2025 The Waldorf Path. ${isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: `The Waldorf Path <${EMAIL_FROM}>`,
        replyTo: EMAIL_REPLY_TO,
        to: [email],
        subject,
        html,
        text,
        tags: [
          { name: 'type', value: 'otp' },
          { name: 'language', value: language },
        ],
      });

      if (error) {
        log.error('Resend error', { error });
        return Response.json(
          { success: false, error: 'AUTH_EMAIL_DELIVERY_FAILED', message: error.message || 'Failed to send email' },
          { status: 500 }
        );
      }

      log.info('OTP sent successfully', { email, messageId: data?.id });

      return Response.json({
        success: true,
        remainingSends: rateLimit.remaining,
      });
    } catch (error) {
      log.error('Resend send error', { error: error instanceof Error ? error.message : 'Unknown' });
      return Response.json(
        { success: false, error: 'AUTH_EMAIL_DELIVERY_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    log.error('Send OTP error', { error: error instanceof Error ? error.message : 'Unknown' });
    return Response.json(
      { success: false, error: 'AUTH_INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}