import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { formatDate, formatKickoff } from '@/lib/data';

type Team = { id: string; name: string; shortName: string; mark: string; primaryColor: string; slug: string };

export function TeamBadge({ team, size = 'normal' }: { team: Team; size?: 'normal' | 'small' | 'large' }) {
  return <span className={`team-badge badge-${size}`} style={{ '--team-color': team.primaryColor } as React.CSSProperties} aria-hidden="true">{team.mark}</span>;
}

export function MatchTile({ match }: { match: { id: string; slug: string; status: string; kickoff: Date; homeScore: number | null; awayScore: number | null; minute: number | null; league: { name: string; slug: string; logo: string }; homeTeam: Team; awayTeam: Team } }) {
  const live = match.status === 'LIVE' || match.status === 'HALFTIME';
  const state = match.status === 'LIVE' ? `${match.minute ?? 0}′` : match.status === 'HALFTIME' ? 'ПЕРЕРЫВ' : match.status === 'FINISHED' ? 'ЗАВЕРШЁН' : formatKickoff(match.kickoff);
  return <Link href={`/matches/${match.slug}`} className="match-tile">
    <div className="match-tile-meta"><span>{match.league.logo} {match.league.name}</span><span className={live ? 'live-text' : ''}>{live ? <i className="live-dot" /> : null}{state}</span></div>
    <div className="match-side"><TeamBadge team={match.homeTeam} /><span>{match.homeTeam.name}</span><b className={live ? 'live-score' : ''}>{match.homeScore ?? '—'}</b></div>
    <div className="match-side"><TeamBadge team={match.awayTeam} /><span>{match.awayTeam.name}</span><b className={live ? 'live-score' : ''}>{match.awayScore ?? '—'}</b></div>
  </Link>;
}

export function LeagueTable({ rows, compact = false }: { rows: Array<{ id: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number; team: Team }>; compact?: boolean }) {
  const visible = compact ? rows.slice(0, 6) : rows;
  return <div className="table-scroll"><table className="league-table"><thead><tr><th>#</th><th>Клуб</th><th>И</th><th>В</th><th>Н</th><th>П</th><th>М</th><th>О</th></tr></thead><tbody>{visible.map((row, index) => <tr key={row.id}><td className="table-position">{String(index + 1).padStart(2, '0')}</td><td><Link href={`/teams/${row.team.slug}`} className="table-team"><TeamBadge team={row.team} size="small" /><span>{row.team.name}</span></Link></td><td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.goalsFor}-{row.goalsAgainst}</td><td className="table-points">{row.points}</td></tr>)}</tbody></table></div>;
}

export function ArticleCard({ article, featured = false }: { article: { id: string; slug: string; title: string; excerpt: string; image: string; author: string; publishedAt: Date; readMinutes: number; category: { name: string } }; featured?: boolean }) {
  return <Link href={`/news/${article.slug}`} className={`article-card ${featured ? 'article-card-featured' : ''}`}><span className="article-image" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.72),transparent 65%),url('${article.image}')` }}><span className="category-tag">{article.category.name}</span>{featured ? <span className="feature-label">В ФОКУСЕ</span> : null}</span><span className="article-content"><strong>{article.title}</strong><span className="article-excerpt">{article.excerpt}</span><span className="article-meta">{article.author}<i />{formatDate(article.publishedAt)}<i /><Clock3 size={13} />{article.readMinutes} мин</span></span></Link>;
}

export function SectionHeading({ eyebrow, title, href, label }: { eyebrow: string; title: string; href?: string; label?: string }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{href ? <Link href={href} className="text-link">{label ?? 'Смотреть всё'} <ArrowUpRight size={16} /></Link> : null}</div>;
}

export function PlayerCard({ player }: { player: { id: string; slug: string; name: string; number: number; position: string; age: number; image: string; goals: number; assists: number; team: Team } }) {
  const role = { GOALKEEPER: 'Вратарь', DEFENDER: 'Защитник', MIDFIELDER: 'Полузащитник', FORWARD: 'Нападающий' }[player.position] ?? player.position;
  return <Link className="player-card" href={`/players/${player.slug}`}><span className="player-photo" style={{ backgroundImage: `url('${player.image}')` }}><b>{String(player.number).padStart(2, '0')}</b></span><span className="player-card-data"><strong>{player.name}</strong><span>{player.team.name} · {role}</span><span>{player.age} лет <i /> {player.goals} голов · {player.assists} ассистов</span></span></Link>;
}
