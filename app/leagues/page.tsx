import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Лиги и турниры' };

export default async function LeaguesPage() {
  const leagues = await prisma.league.findMany({ include: { standings: { include: { team: true }, orderBy: { points: 'desc' }, take: 3 }, _count: { select: { matches: true, teams: true } } }, orderBy: { name: 'asc' } });
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">СЕЗОН 2026/27</span><h1>Главные турниры</h1><p>Следите за гонкой за титул — от первого тура до финального свистка.</p></div><div className="competition-grid">{leagues.map((league) => <Link className="competition-card" href={`/leagues/${league.slug}`} key={league.id}><div className="competition-card-top"><span className="competition-logo">{league.logo}</span><span className="competition-country">{league.country}</span></div><h2>{league.name}</h2><p>{league.season} · {league._count.matches} матчей в календаре</p><div className="competition-leaders">{league.standings.map((row, index) => <div key={row.id}><span>{String(index + 1).padStart(2, '0')}</span><b>{row.team.mark} {row.team.name}</b><strong>{row.points}</strong></div>)}</div><span className="competition-footer">Открыть турнир <ArrowUpRight size={15} /></span></Link>)}</div></div></main>;
}
