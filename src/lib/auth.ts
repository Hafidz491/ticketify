import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserById } from './dataStore';
import { IUserSafe } from './types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'ticketify_super_secret_jwt_key_2026';
export const AUTH_COOKIE_NAME = 'ticketify_session';

/**
 * Creates a signed session token: base64(payload).signature
 */
export function createSessionToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${hmac}`;
}

/**
 * Verifies signed session token and returns userId if valid
 */
export function verifySessionToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64Payload, signature] = parts;
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(b64Payload).digest('base64url');
    if (expected !== signature) return null;

    const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf-8');
    const data = JSON.parse(payloadStr);
    if (!data.userId || data.exp < Date.now()) return null;
    return data.userId;
  } catch {
    return null;
  }
}

/**
 * Helper to get currently authenticated user from NextRequest
 */
export async function getAuthUser(request: NextRequest): Promise<IUserSafe | null> {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  let token = cookie?.value;

  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;

  return await findUserById(userId);
}

/**
 * Attach auth cookie to response
 */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Remove auth cookie from response
 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
