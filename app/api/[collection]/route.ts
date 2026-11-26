import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';
import { isResourceName, parseResource, prismaDelegateNames, ResourceName } from '@/lib/schemas';
import { footballDataProvider } from '@/lib/football-provider';

const includes: Record<string, object> = {
  matches: { league: true, homeTeam: true, awayTeam: true },
  teams: { league: true, standings: { include: { league: true } }, players: { orderBy: { number: 'asc' } }, homeMatches: { include: { awayTeam: true, league: true }, orderBy: { kickoff: 'desc' }, take: 5 }, awayMatches: { include: { homeTeam: true, league: true }, orderBy: { kickoff: 'desc' }, take: 5 } },
  leagues: { teams: { orderBy: { name: 'asc' } }, standings: { include: { team: true }, orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }] }, matches: { include: { homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'asc' }, take: 16 } },
  players: { team: { include: { league: true } } }, articles: { category: true }, videos: { match: { include: { league: true, homeTeam: true, awayTeam: true } } },
};

export async function GET(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  if (!isResourceName(collection)) return NextResponse.json({ error: 'Ресурс не найден.' }, { status: 404 });
  const search = request.nextUrl.searchParams;
  const q = search.get('q')?.trim();
  const admin = Boolean(isAdminRequest(request));
  if (collection === 'matches') {
    const statusValue = search.get('status');
    const status = statusValue && ['SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED'].includes(statusValue) ? statusValue as any : undefined;
    const data = await footballDataProvider.getFixtures({ date: search.get('date') ?? undefined, league: search.get('league') ?? undefined, status });
    return NextResponse.json({ data, total: data.length, provider: footballDataProvider.name });
  }
  const where: Record<string, unknown> = {};
  if (collection === 'articles' && !admin) where.published = true;
  if (q && ['teams', 'leagues', 'players', 'articles', 'videos'].includes(collection)) {
    const field = collection === 'leagues' ? 'name' : 'name';
    where[field] = { contains: q, mode: 'insensitive' };
  }
  const client = prisma as any;
  const data = await client[prismaDelegateNames[collection]].findMany({ where, include: includes[collection], orderBy: collection === 'articles' || collection === 'videos' ? { publishedAt: 'desc' } : { name: 'asc' }, take: Math.min(Number(search.get('limit')) || 100, 250) });
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const session = isAdminRequest(request);
  if (!session) return NextResponse.json({ error: 'Требуется вход редактора.' }, { status: 401 });
  const { collection } = await context.params;
  if (!isResourceName(collection)) return NextResponse.json({ error: 'Ресурс не поддерживает создание.' }, { status: 404 });
  try {
    const body = parseResource(collection as ResourceName, await request.json());
    const data = normalizeDates(collection, body as Record<string, unknown>);
    const client = prisma as any;
    const created = await client[prismaDelegateNames[collection]].create({ data, include: includes[collection] });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) return NextResponse.json({ error: 'Проверьте заполненные поля.', details: (error as any).issues }, { status: 400 });
    if ((error as any)?.code === 'P2002') return NextResponse.json({ error: 'Такая запись уже существует.' }, { status: 409 });
    if ((error as any)?.code === 'P2003') return NextResponse.json({ error: 'Связанная запись не найдена.' }, { status: 400 });
    console.error('Create resource failed:', error);
    return NextResponse.json({ error: 'Не удалось создать запись.' }, { status: 500 });
  }
}

function normalizeDates(collection: ResourceName, data: Record<string, unknown>) {
  const result = { ...data };
  if ((collection === 'matches' || collection === 'articles' || collection === 'videos') && result.kickoff) result.kickoff = new Date(String(result.kickoff));
  if ((collection === 'articles' || collection === 'videos') && result.publishedAt) result.publishedAt = new Date(String(result.publishedAt));
  return result;
}
