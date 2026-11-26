import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/auth';
import { AdminWorkspace } from '@/components/admin-workspace';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Панель редакции' };

export default async function AdminPage() {
  const session = await currentSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) redirect('/admin/login');
  return <main className="page-main"><div className="container"><div className="admin-topline"><div><span className="eyebrow">SPORTPULSE CMS</span><h1>Редакция</h1></div><span>Вы вошли как <b>{session.email}</b></span></div><AdminWorkspace /></div></main>;
}
