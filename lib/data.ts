import { prisma } from '@/lib/db';
import { footballDataProvider } from '@/lib/football-provider';

export const dynamic = 'force-dynamic';

export async function homeData() {
  const [matches, articles, videos, leagues, standings] = await Promise.all([
    footballDataProvider.getFixtures({ date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk' }).format(new Date()) }),
    prisma.article.findMany({ where: { published: true }, include: { category: true }, orderBy: { publishedAt: 'desc' }, take: 8 }),
    prisma.video.findMany({ orderBy: { publishedAt: 'desc' }, take: 4 }),
    prisma.league.findMany({ orderBy: { name: 'asc' } }),
    prisma.standing.findMany({ where: { league: { slug: 'premier-league' } }, include: { team: true }, orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }], take: 6 }),
  ]);
  return { matches, articles, videos, leagues, standings };
}

export async function getLeague(slug: string) {
  return prisma.league.findUnique({ where: { slug }, include: {
    standings: { include: { team: true }, orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }] },
    matches: { include: { homeTeam: true, awayTeam: true, league: true }, orderBy: { kickoff: 'asc' }, take: 16 },
    teams: { orderBy: { name: 'asc' } },
  } });
}

export function formatKickoff(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Minsk' }).format(value);
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Minsk' }).format(value);
}
