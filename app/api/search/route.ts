import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ data: [] });
  const safeQuery = q.slice(0, 80);
  const [teams, leagues, players, articles, videos, matches] = await Promise.all([
    prisma.team.findMany({ where: { name: { contains: safeQuery, mode: 'insensitive' } }, select: { id: true, name: true, slug: true }, take: 5 }),
    prisma.league.findMany({ where: { name: { contains: safeQuery, mode: 'insensitive' } }, select: { id: true, name: true, slug: true }, take: 3 }),
    prisma.player.findMany({ where: { name: { contains: safeQuery, mode: 'insensitive' } }, select: { id: true, name: true, slug: true }, take: 5 }),
    prisma.article.findMany({ where: { published: true, OR: [{ title: { contains: safeQuery, mode: 'insensitive' } }, { excerpt: { contains: safeQuery, mode: 'insensitive' } }] }, select: { id: true, title: true, slug: true }, take: 5 }),
    prisma.video.findMany({ where: { title: { contains: safeQuery, mode: 'insensitive' } }, select: { id: true, title: true, slug: true }, take: 3 }),
    prisma.match.findMany({ where: { OR: [{ homeTeam: { name: { contains: safeQuery, mode: 'insensitive' } } }, { awayTeam: { name: { contains: safeQuery, mode: 'insensitive' } } }, { league: { name: { contains: safeQuery, mode: 'insensitive' } } }] }, select: { id: true, slug: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, league: { select: { name: true } } }, take: 4 }),
  ]);
  const data = [
    ...teams.map((item) => ({ id: item.id, title: item.name, href: `/teams/${item.slug}`, kind: 'Команда' })),
    ...leagues.map((item) => ({ id: item.id, title: item.name, href: `/leagues/${item.slug}`, kind: 'Турнир' })),
    ...players.map((item) => ({ id: item.id, title: item.name, href: `/players/${item.slug}`, kind: 'Игрок' })),
    ...articles.map((item) => ({ id: item.id, title: item.title, href: `/news/${item.slug}`, kind: 'Новость' })),
    ...videos.map((item) => ({ id: item.id, title: item.title, href: `/videos#${item.slug}`, kind: 'Видео' })),
    ...matches.map((item) => ({ id: item.id, title: `${item.homeTeam.name} — ${item.awayTeam.name}`, href: `/matches/${item.slug}`, kind: item.league.name })),
  ];
  return NextResponse.json({ data: data.slice(0, 24) });
}
