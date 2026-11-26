import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { VideoCard } from '@/components/sport-ui';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Видео и хайлайты' };

export default async function VideosPage() {
  const videos = await prisma.video.findMany({ include: { match: { include: { league: true, homeTeam: true, awayTeam: true } } }, orderBy: { publishedAt: 'desc' } });
  const categories = [...new Set(videos.map((video) => video.category))];
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">VIDEO CENTER</span><h1>Футбол в движении</h1><p>Хайлайты, голы и тактические разборы — включайте и смотрите.</p></div><nav className="category-nav">{categories.map((category) => <a href={`#${category.toLowerCase().replaceAll(' ', '-')}`} key={category}>{category}</a>)}</nav>{categories.map((category) => <section className="home-section video-category-section" id={category.toLowerCase().replaceAll(' ', '-')} key={category}><div className="section-heading"><div><span className="eyebrow">VIDEO CENTER</span><h2>{category}</h2></div></div><div className="video-grid-page">{videos.filter((video) => video.category === category).map((video) => <div id={video.slug} key={video.id}><VideoCard video={video} /></div>)}</div></section>)}{videos.length ? null : <p className="muted-copy">Видео появятся здесь после публикации.</p>}</div></main>;
}
