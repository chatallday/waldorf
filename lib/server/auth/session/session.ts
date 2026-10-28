// Session management for authentication
import { serverEnv } from '../env';

// Session configuration
const SESSION_TTL_DAYS = 30;
const SESSION_COOKIE_NAME = 'pv_session';

export interface SessionRecord {
  id: string;
  session_id: string;
  user_id: string;
  email: string;
  role: string;
  is_superadmin: boolean;
  status: 'active' | 'revoked' | 'expired';
  issued_at: string;
  expires_at: string;
  last_activity_at: string;
  ip_hash?: string;
  user_agent_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  isSuperadmin: boolean;
}

export interface CreateSessionResult {
  sessionId: string;
  cookie: string;
  sessionData: {
    sessionId: string;
    userId: string;
    email: string;
    role: string;
    isSuperadmin: boolean;
  };
}

async function hashSessionId(sessionId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(sessionId + process.env.SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSessionId(): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(n => n.toString(16).padStart(8, '0'))
    .join('');
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(ip + (process.env.SESSION_SECRET || ''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashUserAgent(userAgent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(userAgent + process.env.SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(
  userId: string,
  email: string,
  role: string,
  isSuperadmin: boolean,
  requestIp?: string,
  userAgent?: string
): Promise<{
  sessionId: string;
  cookie: string;
  sessionData: {
    sessionId: string;
    userId: string;
    email: string;
    role: string;
    isSuperadmin: boolean;
  };
}> {
  const sessionId = generateSessionId();
  const sessionIdHash = await hashSessionId(sessionId);
  const now = new Date();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const fields = {
    session_id: sessionIdHash,
    user_id: userId,
    email: email.toLowerCase(),
    role,
    is_superadmin: isSuperadmin,
    status: 'active',
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity_at: new Date().toISOString(),
    ip_hash: requestIp ? await hashIp(requestIp) : undefined,
    user_agent_hash: userAgent ? await hashUserAgent(userAgent) : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // TODO: Store in Teable
  // await teableClient.create('sessions', fields);

  const cookie = `pv_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`;
  
  return { 
    sessionId, 
    cookie: `pv_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`,
    sessionData: { sessionId, userId, email, role, isSuperadmin }
  };
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(ip + process.env.SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSessionId(): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(n => n.toString(16).padStart(8, '0'))
    .join('');
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = new TextEncoder().encode(ip + process.env.SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const SESSION_TTL_DAYS = 30;
const SESSION_COOKIE_NAME = 'pv_session';

export interface SessionData {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  isSuperadmin: boolean;
}

export interface CreateSessionResult {
  sessionId: string;
  cookie: string;
  sessionData: {
    sessionId: string;
    userId: string;
    email: string;
    role: string;
    isSuperadmin: boolean;
  };
}

export async function validateSession(sessionId: string): Promise<{
  valid: boolean;
  sessionData?: {
    userId: string;
    email: string;
    role: string;
    isSuperadmin: boolean;
  };
} {
  // TODO: Implement session validation with Teable
  return { valid: false };
}

export async function getSessionFromCookie(cookieHeader: string | null): Promise<any> {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('pv_session='));
  if (!sessionCookie) return null;
  
  const sessionId = sessionCookie.split('=')[1];
  if (!sessionId) return null;
  
  // TODO: Implement session validation with Teable
  return null;
}

export { SESSION_TTL_DAYS, SESSION_COOKIE_NAME };