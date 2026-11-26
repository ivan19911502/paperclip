import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MatchTile, PlayerCard, SectionHeading } from '@/components/content';
import { FavoriteButton } from '@/components/sport-ui';

export const dynamic = 'force-dynamic';
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const team = await prisma.team.findUnique({ where: { slug }, select: { name: true } }); return { title: team?.name ?? 'Команда' };
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;
  const team = await prisma.team.findUnique({ where: { slug }, include: { league: true, standings: { include: { league: true } }, players: { orderBy: { number: 'asc' } }, homeMatches: { include: { league: true, homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'desc' }, take: 6 }, awayMatches: { include: { league: true, homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'desc' }, take: 6 } } });
  if (!team) notFound();
  const matches = [...team.homeMatches, ...team.awayMatches].sort((a, b) => b.kickoff.getTime() - a.kickoff.getTime()).slice(0, 6);
  const standing = team.standings.find((item) => item.leagueId === team.leagueId);
  return <main className="page-main"><div className="container"><div className="team-page-top"><div className="team-hero"><span className="team-hero-mark" style={{ color: team.primaryColor }}>{team.mark}</span><div className="team-hero-copy"><div className="breadcrumb"><Link href="/teams">Команды</Link><span>/</span>{team.league?.name}</div><span className="eyebrow">{team.country} · {team.league?.name}</span><h1>{team.name}</h1><p>Сезон 2026/27 · {standing ? `${standing.points} очков в таблице` : 'европейский турнир'}</p></div></div><FavoriteButton type="TEAM" targetId={team.id} label="В избранное" /></div>
    <div className="stat-strip"><div className="stat-cell"><b>{standing?.played ?? '—'}</b><span>Матчи</span></div><div className="stat-cell"><b>{standing?.won ?? '—'}</b><span>Победы</span></div><div className="stat-cell"><b>{standing?.goalsFor ?? '—'}</b><span>Забито</span></div><div className="stat-cell"><b>{standing ? standing.points : '—'}</b><span>Очки</span></div></div>
    <section className="home-section"><SectionHeading eyebrow="СОСТАВ" title={`Игроки · ${team.players.length}`} /><div className="squad-grid">{team.players.map((player) => <PlayerCard key={player.id} player={{ ...player, team }} />)}</div></section>
    <section className="home-section"><SectionHeading eyebrow="ПОСЛЕДНИЕ ТУРЫ" title="Матчи команды" href={`/leagues/${team.league?.slug}`} label="Турнир" /><div className="league-group-matches">{matches.map((match) => <MatchTile key={match.id} match={match} />)}</div></section>
  </div></main>;
}
