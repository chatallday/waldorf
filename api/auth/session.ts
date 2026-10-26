// Session check endpoint - Phase 1C: Real session validation with Teable

import { getSessionFromCookie, validateSession } from '../../_shared';
import { userRepository } from '../../src/server/teable/repositories/users';
import { resolveSuperadminStatus } from '../../src/server/auth/superadmin/superadmin';
import { logger } from '../../src/server/logger';
import { generateRequestId } from '../../src/server/request-id';

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') || `req_${Date.now()}`;
  const log = logger.withRequest(requestId);

  try {
    const cookieHeader = request.headers.get('Cookie');
    const sessionData = await getSessionFromCookie(cookieHeader);

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