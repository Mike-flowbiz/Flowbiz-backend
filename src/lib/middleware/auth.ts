import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Get authentication token from cookies or Authorization header
 */
export function getToken(request: NextRequest): string | null {
  // Try cookie first
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Authenticate request and return user info
 */
export function authenticate(request: NextRequest): { user: AuthUser } | null {
  try {
    const token = getToken(request);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return { user: decoded };
  } catch (error) {
    return null;
  }
}

/**
 * Create authenticated response helper
 */
export function createAuthResponse(
  message: string,
  status: number = 401
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create authorization response helper
 */
export function createAuthzResponse(
  message: string = 'Insufficient permissions',
  status: number = 403
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Middleware wrapper for authenticated routes
 * Supports both regular routes and dynamic routes with params
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const authResult = authenticate(request);
    if (!authResult) {
      return createAuthResponse('Authentication required');
    }
    return handler(request, authResult.user, context);
  };
}

/**
 * Middleware wrapper for role-based authorization
 * Supports both regular routes and dynamic routes with params
 */
export function withAuthz(
  roles: UserRole[],
  handler: (request: NextRequest, user: AuthUser, context?: any) => Promise<NextResponse>
) {
  return withAuth(async (request, user, context) => {
    if (!roles.includes(user.role)) {
      return createAuthzResponse();
    }
    return handler(request, user, context);
  });
}
