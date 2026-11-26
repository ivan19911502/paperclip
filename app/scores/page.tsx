import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { footballDataProvider } from '@/lib/football-provider';
import { ScoresBrowser } from '@/components/scores-browser';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Матчи и результаты' };

export default async function ScoresPage() {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk' }).format(new Date());
  const [matches, leagues] = await Promise.all([
    footballDataProvider.getFixtures({ date }),
    prisma.league.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true } }),
  ]);
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">КАЛЕНДАРЬ · LIVE</span><h1>Матчи и результаты</h1><p>Счёт, время и турнирная таблица — всё, что происходит на поле, в одном месте.</p></div><ScoresBrowser initialMatches={JSON.parse(JSON.stringify(matches))} leagues={leagues} /><p className="demo-disclaimer">Демонстрационные результаты · обновление данных не связано с официальными live-трансляциями.</p></div></main>;
}
