'use client';

import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/sport-ui';
import { MatchTile } from '@/components/content';

type Match = { id: string; slug: string; status: string; kickoff: string; homeScore: number | null; awayScore: number | null; minute: number | null; league: { id: string; name: string; slug: string; logo: string }; homeTeam: { id: string; name: string; shortName: string; mark: string; primaryColor: string; slug: string }; awayTeam: { id: string; name: string; shortName: string; mark: string; primaryColor: string; slug: string } };
type League = { id: string; slug: string; name: string };

function localDate() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }

export function ScoresBrowser({ initialMatches, leagues }: { initialMatches: Match[]; leagues: League[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [date, setDate] = useState(localDate());
  const [league, setLeague] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  async function setDay(delta: number) {
    const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + delta);
    const value = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk', year: 'numeric', month: '2-digit', day: '2-digit' }).format(next);
    await load(value);
  }
  async function load(nextDate = date) {
    setDate(nextDate); setLoading(true);
    try { const response = await fetch(`/api/matches?date=${nextDate}${league !== 'all' ? `&league=${league}` : ''}`, { cache: 'no-store' }); const json = await response.json(); setMatches(json.data ?? []); }
    catch { setMatches([]); }
    finally { setLoading(false); }
  }
  async function selectLeague(value: string) { setLeague(value); setLoading(true); try { const response = await fetch(`/api/matches?date=${date}${value !== 'all' ? `&league=${value}` : ''}`, { cache: 'no-store' }); const json = await response.json(); setMatches(json.data ?? []); } catch { setMatches([]); } finally { setLoading(false); } }

  const filtered = useMemo(() => status === 'all' ? matches : matches.filter((match) => status === 'LIVE' ? match.status === 'LIVE' || match.status === 'HALFTIME' : match.status === status), [matches, status]);
  const grouped = new Map<string, Match[]>();
  for (const match of filtered) grouped.set(match.league.id, [...(grouped.get(match.league.id) ?? []), match]);
  const prettyDate = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Minsk', day: 'numeric', month: 'long', weekday: 'long' }).format(new Date(`${date}T12:00:00`));

  return <><div className="score-toolbar"><button className="filter-button" onClick={() => setDay(-1)}>← Вчера</button><button className="filter-button active" onClick={() => load(localDate())}>{prettyDate}</button><button className="filter-button" onClick={() => setDay(1)}>Завтра →</button><span className="toolbar-spacer" /><button className={`filter-button ${status === 'all' ? 'active' : ''}`} onClick={() => setStatus('all')}>Все</button><button className={`filter-button ${status === 'LIVE' ? 'active' : ''}`} onClick={() => setStatus('LIVE')}>Live</button><button className={`filter-button ${status === 'SCHEDULED' ? 'active' : ''}`} onClick={() => setStatus('SCHEDULED')}>Предстоящие</button><button className={`filter-button ${status === 'FINISHED' ? 'active' : ''}`} onClick={() => setStatus('FINISHED')}>Завершённые</button></div>
    <div className="league-filter"><button onClick={() => selectLeague('all')} className={league === 'all' ? 'league-chip active' : 'league-chip'}>Все турниры</button>{leagues.map((item) => <button onClick={() => selectLeague(item.slug)} key={item.id} className={league === item.slug ? 'league-chip active' : 'league-chip'}>{item.name}</button>)}</div>
    {loading ? <div className="loading-state"><span className="spinner" />Загружаем матчи</div> : grouped.size ? [...grouped.entries()].map(([leagueId, rows]) => <section className="league-group" key={leagueId}><div className="league-group-heading"><span className="league-crest-small">{rows[0].league.logo}</span><b>{rows[0].league.name}</b><small>{rows.length} матча</small></div><div className="league-group-matches">{rows.map((match) => <MatchTile match={{ ...match, kickoff: new Date(match.kickoff) }} key={match.id} />)}</div></section>) : <EmptyState title="На эту дату матчей нет" detail="Выберите другой день или турнир. Демонстрационный календарь содержит матчи на сегодня." />}</>;
}
