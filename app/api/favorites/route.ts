import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { shouldUseSecureCookie } from '@/lib/auth';

const favoriteInput = z.object({ type: z.enum(['TEAM', 'LEAGUE', 'ARTICLE', 'VIDEO']), targetId: z.string().min(1).max(100) });
const cookieName = 'sportpulse_visitor';

export async function GET(request: NextRequest) {
  const ownerKey = request.cookies.get(cookieName)?.value;
  if (!ownerKey) return NextResponse.json({ data: [] });
  const items = await prisma.favorite.findMany({ where: { ownerKey }, include: { article: { include: { category: true } }, video: true }, orderBy: { createdAt: 'desc' } });
  const ids = items.filter((item) => item.type === 'TEAM' || item.type === 'LEAGUE').map((item) => item.targetId);
  const [teams, leagues] = await Promise.all([prisma.team.findMany({ where: { id: { in: ids } } }), prisma.league.findMany({ where: { id: { in: ids } } })]);
  const lookup = new Map<string, { title: string; href: string; mark: string; kind: string }>([
    ...teams.map((item) => [item.id, { title: item.name, href: `/teams/${item.slug}`, mark: item.mark, kind: 'Команда' }] as const),
    ...leagues.map((item) => [item.id, { title: item.name, href: `/leagues/${item.slug}`, mark: item.logo, kind: 'Турнир' }] as const),
  ]);
  const data = items.map((item) => {
    if (item.type === 'ARTICLE' && item.article) return { id: item.id, targetId: item.targetId, type: item.type, title: item.article.title, href: `/news/${item.article.slug}`, mark: '✳', kind: item.article.category.name };
    if (item.type === 'VIDEO' && item.video) return { id: item.id, targetId: item.targetId, type: item.type, title: item.video.title, href: `/videos#${item.video.slug}`, mark: '▶', kind: 'Видео' };
    const found = lookup.get(item.targetId);
    return found ? { id: item.id, targetId: item.targetId, type: item.type, ...found } : null;
  }).filter(Boolean);
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  let input: z.infer<typeof favoriteInput>;
  try { input = favoriteInput.parse(await request.json()); } catch { return NextResponse.json({ error: 'Некорректное избранное.' }, { status: 400 }); }
  const exists = input.type === 'TEAM' ? await prisma.team.count({ where: { id: input.targetId } }) : input.type === 'LEAGUE' ? await prisma.league.count({ where: { id: input.targetId } }) : input.type === 'ARTICLE' ? await prisma.article.count({ where: { id: input.targetId, published: true } }) : await prisma.video.count({ where: { id: input.targetId } });
  if (!exists) return NextResponse.json({ error: 'Объект не найден.' }, { status: 404 });
  const ownerKey = request.cookies.get(cookieName)?.value ?? randomUUID();
  const data: { ownerKey: string; type: typeof input.type; targetId: string; articleId?: string; videoId?: string } = { ownerKey, type: input.type, targetId: input.targetId };
  if (input.type === 'ARTICLE') data.articleId = input.targetId;
  if (input.type === 'VIDEO') data.videoId = input.targetId;
  const favorite = await prisma.favorite.upsert({ where: { ownerKey_type_targetId: { ownerKey, type: input.type, targetId: input.targetId } }, update: {}, create: data });
  const response = NextResponse.json({ data: favorite }, { status: 201 });
  if (!request.cookies.get(cookieName)) response.cookies.set(cookieName, ownerKey, { httpOnly: true, sameSite: 'lax', secure: shouldUseSecureCookie(request), maxAge: 60 * 60 * 24 * 365, path: '/' });
  return response;
}

export async function DELETE(request: NextRequest) {
  const ownerKey = request.cookies.get(cookieName)?.value;
  if (!ownerKey) return NextResponse.json({ ok: true });
  let input: z.infer<typeof favoriteInput>;
  try { input = favoriteInput.parse(await request.json()); } catch { return NextResponse.json({ error: 'Некорректное избранное.' }, { status: 400 }); }
  await prisma.favorite.deleteMany({ where: { ownerKey, type: input.type, targetId: input.targetId } });
  return NextResponse.json({ ok: true });
}
