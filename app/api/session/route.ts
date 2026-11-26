import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSession, currentSession, sessionCookieName, sessionMaxAge, shouldUseSecureCookie } from '@/lib/auth';

const credentials = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });

export async function GET() {
  const session = await currentSession();
  return NextResponse.json({ authenticated: Boolean(session && (session.role === 'ADMIN' || session.role === 'EDITOR')), user: session ? { id: session.id, email: session.email, role: session.role } : null });
}

export async function POST(request: NextRequest) {
  let input: z.infer<typeof credentials>;
  try { input = credentials.parse(await request.json()); }
  catch { return NextResponse.json({ error: 'Укажите корректный email и пароль.' }, { status: 400 }); }
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR') || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return NextResponse.json({ error: 'Неверный email или пароль.' }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email, role: user.role } });
  response.cookies.set(sessionCookieName, createSession(user), { httpOnly: true, sameSite: 'lax', secure: shouldUseSecureCookie(request), maxAge: sessionMaxAge, path: '/' });
  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(sessionCookieName, '', { httpOnly: true, sameSite: 'lax', secure: shouldUseSecureCookie(request), maxAge: 0, path: '/' });
  return response;
}
