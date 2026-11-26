import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate, formatKickoff } from '@/lib/data';
import { MatchTile, PlayerCard, SectionHeading, TeamBadge } from '@/components/content';

export const dynamic = 'force-dynamic';
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const match = await prisma.match.findUnique({ where: { slug }, include: { homeTeam: true, awayTeam: true } }); return { title: match ? `${match.homeTeam.name} — ${match.awayTeam.name}` : 'Матч' };
}

export default async function MatchPage({ params }: PageProps) {
  const { slug } = await params;
  const match = await prisma.match.findUnique({ where: { slug }, include: { league: true, homeTeam: { include: { players: { orderBy: { goals: 'desc' }, take: 4 } } }, awayTeam: { include: { players: { orderBy: { goals: 'desc' }, take: 4 } } }, events: { orderBy: { minute: 'asc' } }, videos: true } });
  if (!match) notFound();
  const live = match.status === 'LIVE' || match.status === 'HALFTIME';
  const status = match.status === 'SCHEDULED' ? `Начало в ${formatKickoff(match.kickoff)}` : match.status === 'FINISHED' ? 'Матч завершён' : match.status === 'HALFTIME' ? 'Перерыв' : `В игре · ${match.minute ?? 0}′`;
  const stats = (match.stats ?? { possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0], corners: [0, 0], fouls: [0, 0] }) as Record<string, number[]>;
  const statRows = [['Владение мячом', 'possession', '%'], ['Удары', 'shots', ''], ['В створ', 'shotsOnTarget', ''], ['Угловые', 'corners', ''], ['Фолы', 'fouls', '']];
  const eventIcon = { GOAL: '⚽', YELLOW_CARD: '🟨', RED_CARD: '🟥', SUBSTITUTION: '↕', VAR: '▣' } as Record<string, string>;
  return <main className="page-main"><div className="container"><div className="breadcrumb"><Link href="/scores">Матчи</Link><span>/</span><Link href={`/leagues/${match.league.slug}`}>{match.league.name}</Link><span>/</span>{match.round}</div><section className="match-center"><div className="match-center-meta">{match.league.logo} {match.league.name} · {match.round ?? 'Сезон 2026/27'}</div><div className="match-center-score"><Link href={`/teams/${match.homeTeam.slug}`} className="match-center-team"><TeamBadge team={match.homeTeam} size="large" /><b>{match.homeTeam.name}</b></Link><div><div className="match-center-scoreline">{match.homeScore ?? '—'} <span>:</span> {match.awayScore ?? '—'}</div><div className={live ? 'match-center-status live-text' : 'match-center-status'}>{live ? <i className="live-dot" /> : null}{status}</div></div><Link href={`/teams/${match.awayTeam.slug}`} className="match-center-team"><TeamBadge team={match.awayTeam} size="large" /><b>{match.awayTeam.name}</b></Link></div><p className="match-center-date">{formatDate(match.kickoff)} · {match.venue ?? 'Стадион не указан'}</p></section>
    <nav className="subnav"><a className="active" href="#overview">Обзор</a><a href="#events">События</a><a href="#stats">Статистика</a><a href="#lineups">Составы</a></nav>
    <div className="match-detail-grid"><div><section id="events" className="info-panel"><h3>Ход матча</h3>{match.events.length ? <div className="event-list">{match.events.map((event) => <div className="event-row" key={event.id}><time>{event.minute}′</time><span>{eventIcon[event.type] ?? '•'} {event.playerName} · {event.detail ?? event.type}</span></div>)}</div> : <p className="muted-copy">События матча появятся во время игры.</p>}</section><section id="stats" className="info-panel match-stats-panel"><h3>Статистика</h3>{statRows.map(([name, key, unit]) => { const values = stats[key] ?? [0, 0]; const total = values[0] + values[1] || 1; return <div className="stat-comparison" key={key}><div><b>{values[0]}{unit}</b><span>{name}</span><b>{values[1]}{unit}</b></div><div className="stat-bar"><i style={{ width: `${Math.round(values[0] / total * 100)}%` }} /><i style={{ width: `${Math.round(values[1] / total * 100)}%` }} /></div></div>; })}</section></div><aside><section id="lineups" className="info-panel"><h3>Составы</h3><p className="lineup-team"><TeamBadge team={match.homeTeam} />{match.homeTeam.name}<span>{match.homeFormation ?? '4-3-3'}</span></p>{match.homeTeam.players.slice(0, 4).map((player) => <PlayerCard key={player.id} player={{ ...player, team: match.homeTeam }} />)}<p className="lineup-team lineup-away"><TeamBadge team={match.awayTeam} />{match.awayTeam.name}<span>{match.awayFormation ?? '4-2-3-1'}</span></p>{match.awayTeam.players.slice(0, 4).map((player) => <PlayerCard key={player.id} player={{ ...player, team: match.awayTeam }} />)}</section>{match.videos.length ? <section className="info-panel"><h3>Видео матча</h3><Link href={`/videos#${match.videos[0].slug}`}>{match.videos[0].title} →</Link></section> : null}</aside></div>
    <section id="overview" className="home-section"><SectionHeading eyebrow="ЭТОТ ТУРНИР" title="Другие матчи" href={`/leagues/${match.league.slug}`} /><div className="league-group-matches">{(await prisma.match.findMany({ where: { leagueId: match.leagueId, id: { not: match.id } }, include: { league: true, homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'asc' }, take: 4 })).map((item) => <MatchTile key={item.id} match={item} />)}</div></section>
  </div></main>;
}
