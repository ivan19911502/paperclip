import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';
import { isResourceName, parseResource, prismaDelegateNames } from '@/lib/schemas';

const includes: Record<string, object> = { matches: { league: true, homeTeam: true, awayTeam: true, events: { orderBy: { minute: 'asc' } }, videos: true }, teams: { league: true, standings: { include: { league: true } }, players: { orderBy: { number: 'asc' } } }, leagues: { standings: { include: { team: true }, orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }] }, matches: { include: { homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'asc' } }, teams: true }, players: { team: { include: { league: true } } }, articles: { category: true }, videos: { match: { include: { league: true, homeTeam: true, awayTeam: true } } } };

export async function GET(_request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await context.params;
  if (!isResourceName(collection)) return NextResponse.json({ error: 'Ресурс не найден.' }, { status: 404 });
  const client = prisma as any;
  const data = await client[prismaDelegateNames[collection]].findFirst({ where: { OR: [{ id }, { slug: id }] }, include: includes[collection] });
  if (!data || (collection === 'articles' && !data.published)) return NextResponse.json({ error: 'Запись не найдена.' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Требуется вход редактора.' }, { status: 401 });
  const { collection, id } = await context.params;
  if (!isResourceName(collection)) return NextResponse.json({ error: 'Ресурс не поддерживает редактирование.' }, { status: 404 });
  try {
    const input = parseResource(collection, await request.json(), true) as Record<string, unknown>;
    if (input.kickoff) input.kickoff = new Date(String(input.kickoff));
    if (input.publishedAt) input.publishedAt = new Date(String(input.publishedAt));
    const client = prisma as any;
    const data = await client[prismaDelegateNames[collection]].update({ where: { id }, data: input, include: includes[collection] });
    return NextResponse.json({ data });
  } catch (error) {
    if ((error as any)?.code === 'P2025') return NextResponse.json({ error: 'Запись не найдена.' }, { status: 404 });
    if ((error as any)?.code === 'P2002') return NextResponse.json({ error: 'Значение slug уже используется.' }, { status: 409 });
    if (error instanceof Error && 'issues' in error) return NextResponse.json({ error: 'Проверьте заполненные поля.', details: (error as any).issues }, { status: 400 });
    console.error('Update resource failed:', error);
    return NextResponse.json({ error: 'Не удалось обновить запись.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Требуется вход редактора.' }, { status: 401 });
  const { collection, id } = await context.params;
  if (!isResourceName(collection)) return NextResponse.json({ error: 'Ресурс не поддерживает удаление.' }, { status: 404 });
  const client = prisma as any;
  try { await client[prismaDelegateNames[collection]].delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch (error) {
    if ((error as any)?.code === 'P2025') return NextResponse.json({ error: 'Запись не найдена.' }, { status: 404 });
    if ((error as any)?.code === 'P2003') return NextResponse.json({ error: 'Сначала удалите зависимые записи или отвяжите их.' }, { status: 409 });
    console.error('Delete resource failed:', error);
    return NextResponse.json({ error: 'Не удалось удалить запись.' }, { status: 500 });
  }
}
