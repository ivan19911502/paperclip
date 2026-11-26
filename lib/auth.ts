import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'sportpulse_session';
const SESSION_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');
  return value;
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSession(user: { id: string; email: string; role: string }) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_AGE })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { id: string; email: string; role: string; exp: number };
    if (session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function requestSession(request: NextRequest) {
  return readSession(request.cookies.get(COOKIE_NAME)?.value);
}

export function shouldUseSecureCookie(request: NextRequest) {
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim().toLowerCase();
  return request.nextUrl.protocol === 'https:' || forwardedProtocol === 'https';
}

export function isAdminRequest(request: NextRequest) {
  const session = requestSession(request);
  return session && (session.role === 'ADMIN' || session.role === 'EDITOR') ? session : null;
}

export async function currentSession() {
  const cookieStore = await cookies();
  return readSession(cookieStore.get(COOKIE_NAME)?.value);
}

export const sessionCookieName = COOKIE_NAME;
export const sessionMaxAge = SESSION_AGE;
