import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Команды' };

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({ include: { league: true, standings: true }, orderBy: [{ league: { name: 'asc' } }, { name: 'asc' }] });
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">КЛУБЫ И СБОРНЫЕ</span><h1>Команды</h1><p>Статистика, составы и последние матчи клубов ведущих европейских турниров.</p></div><div className="team-directory">{teams.map((team) => <Link href={`/teams/${team.slug}`} className="team-directory-card" key={team.id}><span className="team-badge badge-large">{team.mark}</span><span><strong>{team.name}</strong><small>{team.league?.name ?? 'Европа'} · {team.country}</small></span><b>{team.standings[0]?.points ?? '—'}<small> очков</small></b></Link>)}</div></div></main>;
}
