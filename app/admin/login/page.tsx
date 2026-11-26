import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/auth';
import { AdminLogin } from '@/components/admin-login';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Вход редакции' };

export default async function AdminLoginPage() {
  const session = await currentSession();
  if (session && (session.role === 'ADMIN' || session.role === 'EDITOR')) redirect('/admin');
  return <main className="page-main"><div className="container"><div className="login-card"><span className="eyebrow">SPORTPULSE CMS</span><h1>Вход редакции</h1><p>Авторизуйтесь, чтобы управлять новостями, командами и матчами.</p><AdminLogin /></div></div></main>;
}
