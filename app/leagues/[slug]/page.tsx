import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { LeagueTable, MatchTile, PlayerCard, SectionHeading } from '@/components/content';
import { FavoriteButton } from '@/components/sport-ui';

export const dynamic = 'force-dynamic';
type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = await prisma.league.findUnique({ where: { slug }, select: { name: true } });
  return { title: league?.name ?? 'Турнир' };
}

export default async function LeaguePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab = 'overview' } = await searchParams;
  const league = await prisma.league.findUnique({ where: { slug }, include: { standings: { include: { team: true }, orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }] }, matches: { include: { league: true, homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'asc' }, take: 32 } } });
  if (!league) notFound();
  const players = await prisma.player.findMany({ where: slug === 'champions-league' ? {} : { team: { leagueId: league.id } }, include: { team: true }, orderBy: [{ goals: 'desc' }, { assists: 'desc' }], take: 6 });
  const matches = tab === 'results' ? league.matches.filter((match) => match.status === 'FINISHED') : tab === 'schedule' ? league.matches.filter((match) => match.status === 'SCHEDULED') : league.matches;
  const tabs = [['overview', 'Обзор'], ['schedule', 'Календарь'], ['results', 'Результаты'], ['standings', 'Таблица'], ['scorers', 'Бомбардиры']];
  return <main className="page-main"><div className="container"><div className="league-title-row"><span className="league-hero-logo">{league.logo}</span><div className="page-hero league-page-hero"><div className="breadcrumb"><Link href="/leagues">Турниры</Link><span>/</span>{league.country}</div><span className="eyebrow">{league.country} · {league.season}</span><h1>{league.name}</h1><p>Таблица, календарь и главные цифры сезона.</p></div><FavoriteButton type="LEAGUE" targetId={league.id} label="В избранное" /></div>
    <nav className="subnav">{tabs.map(([key, name]) => <Link key={key} className={tab === key ? 'active' : ''} href={`/leagues/${league.slug}?tab=${key}`}>{name}</Link>)}</nav>
    {tab === 'standings' || tab === 'overview' ? <div className="standings-layout"><section><div className="section-heading"><div><span className="eyebrow">ТУРНИРНАЯ ТАБЛИЦА</span><h2>Сезон {league.season}</h2></div></div><div className="table-panel"><LeagueTable rows={league.standings} /></div></section><aside className="info-panel"><h3>Последние результаты</h3><div className="match-list">{league.matches.filter((match) => match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'HALFTIME').slice(0, 4).map((match) => <MatchTile key={match.id} match={match} />)}</div><div className="league-mini-info"><b>{league.matches.length}</b><span>матчей в календаре</span><b>{league.standings.length}</b><span>команд в таблице</span></div></aside></div> : null}
    {tab === 'overview' || tab === 'schedule' || tab === 'results' ? <section className="league-matches-section"><SectionHeading eyebrow={tab === 'results' ? 'ИТОГИ' : 'РАСПИСАНИЕ'} title={tab === 'results' ? 'Сыгранные матчи' : 'Ближайшие матчи'} /><div className="league-group-matches">{matches.length ? matches.map((match) => <MatchTile key={match.id} match={match} />) : <p className="muted-copy">Пока нет матчей в этом разделе.</p>}</div></section> : null}
    {tab === 'scorers' || tab === 'overview' ? <section className="league-matches-section"><SectionHeading eyebrow="СТАТИСТИКА СЕЗОНА" title="Лучшие бомбардиры" /><div className="scorer-list">{players.map((player) => <PlayerCard key={player.id} player={player} />)}</div></section> : null}
    <p className="demo-disclaimer">Таблица и статистика в демонстрационном режиме иллюстрируют работу платформы. Обновление не связано с официальными лигами.</p>
  </div></main>;
}
