import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ArticleCard, SectionHeading } from '@/components/content';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Новости футбола' };

export default async function NewsPage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({ where: { published: true }, include: { category: true }, orderBy: { publishedAt: 'desc' }, take: 30 }),
    prisma.category.findMany({ where: { articles: { some: { published: true } } }, orderBy: { name: 'asc' } }),
  ]);
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const rest = articles.filter((article) => article.id !== featured?.id);
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">РЕДАКЦИЯ SPORTPULSE</span><h1>Новости футбола</h1><p>Главное о матче, трансфере и людях, которые меняют игру.</p></div><nav className="category-nav"><Link href="/news" className="active">Все темы</Link>{categories.map((category) => <a href={`#${category.slug}`} key={category.id}>{category.name}</a>)}</nav>{featured ? <section className="news-feature"><ArticleCard article={featured} featured /></section> : null}{categories.map((category) => { const items = rest.filter((article) => article.categoryId === category.id); return items.length ? <section id={category.slug} className="home-section category-section" key={category.id}><SectionHeading eyebrow="ТЕМА РЕДАКЦИИ" title={category.name} /><div className="news-grid">{items.map((article) => <ArticleCard article={article} key={article.id} />)}</div></section> : null; })}</div></main>;
}
