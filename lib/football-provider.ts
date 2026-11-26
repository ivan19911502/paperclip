import type { MatchStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export type MatchFeedFilters = { date?: string; league?: string; status?: MatchStatus };
const fixtureInclude = { league: true, homeTeam: true, awayTeam: true } satisfies Prisma.MatchInclude;
export type MatchFeedFixture = Prisma.MatchGetPayload<{ include: typeof fixtureInclude }>;

export interface FootballDataProvider {
  readonly name: string;
  getFixtures(filters?: MatchFeedFilters): Promise<MatchFeedFixture[]>;
}

/** Database-backed mock provider. Replace this adapter when a licensed match feed is configured. */
class DemoFootballProvider implements FootballDataProvider {
  readonly name = 'demo';

  async getFixtures(filters: MatchFeedFilters = {}) {
    const where: Record<string, unknown> = {};
    if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      const start = new Date(`${filters.date}T00:00:00+03:00`);
      where.kickoff = { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (filters.league) where.league = { slug: filters.league };
    if (filters.status) where.status = filters.status;
    return prisma.match.findMany({ where, include: fixtureInclude, orderBy: { kickoff: 'asc' }, take: 250 });
  }
}

export const footballDataProvider: FootballDataProvider = new DemoFootballProvider();
