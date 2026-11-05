// Session check endpoint - Self-contained implementation

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

// Simple session cookie parsing
function getSessionFromCookie(cookieHeader: string | null): { userId: string; email: string } | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const sessionCookie = cookies['session'] || cookies['auth_session'];
  if (!sessionCookie) return null;
  
  try {
    // In production, this would be a signed/encrypted cookie
    // For now, we'll just parse a simple JSON
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
    if (sessionData && sessionData.userId && sessionData.email) {
      return { userId: sessionData.userId, email: sessionData.email };
    }
  } catch {
    // Invalid session cookie
  }
  return null;
}

// Superadmin check
function resolveSuperadminStatus(email: string): boolean {
  const superadmins = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return superadmins.includes(email.toLowerCase());
}

// Mock user repository for development
const userRepository = {
  async findById(userId: string): Promise<any> {
    // In production, this would fetch from Teable
    // For now, return a mock user if it's a known test ID
    if (userId === 'test-user' || userId === 'admin') {
      return {
        id: userId,
        email: 'admin@thewaldorfpath.com',
        public_reference: 'ADMIN001',
        selected_language: 'en',
        role: 'admin',
      };
    }
    return null;
  }
};

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const log = logger.withRequest(requestId);

  try {
    const cookieHeader = request.headers.get('Cookie');
    const sessionData = getSessionFromCookie(cookieHeader);

    if (!sessionData) {
      return Response.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Get fresh user data
    const user = await userRepository.findById(sessionData.userId);
    if (!user) {
      return Response.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    const isSuperadmin = resolveSuperadminStatus(user.email);

    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        public_reference: user.public_reference,
        selected_language: user.selected_language,
        role: user.role,
        isSuperadmin,
      },
    });
  } catch (error) {
    log.error('Session check error', { error: error instanceof Error ? error.message : 'Unknown' });
    return Response.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}