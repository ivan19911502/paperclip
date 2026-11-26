import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/data';
import { ArticleCard } from '@/components/content';
import { FavoriteButton } from '@/components/sport-ui';

export const dynamic = 'force-dynamic';
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const article = await prisma.article.findUnique({ where: { slug }, select: { title: true, excerpt: true } }); return { title: article?.title ?? 'Новость', description: article?.excerpt };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug }, include: { category: true } });
  if (!article || !article.published) notFound();
  const related = await prisma.article.findMany({ where: { published: true, categoryId: article.categoryId, id: { not: article.id } }, include: { category: true }, orderBy: { publishedAt: 'desc' }, take: 3 });
  return <main className="page-main"><div className="container"><article className="article-layout"><div className="article-main"><div className="breadcrumb"><Link href="/news">Новости</Link><span>/</span>{article.category.name}</div><span className="category-tag">{article.category.name}</span><h1 className="article-title">{article.title}</h1><p className="article-lead">{article.excerpt}</p><div className="article-toolbar"><span className="author-avatar">{article.author[0]}</span><b>{article.author}</b><i />{formatDate(article.publishedAt)}<i /><Clock3 size={13} />{article.readMinutes} мин чтения<FavoriteButton type="ARTICLE" targetId={article.id} label="Сохранить" /></div><div className="article-body-cover" style={{ backgroundImage: `url('${article.image}')` }} /><div className="article-body-content">{article.body.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<p>Следите за обновлениями SportPulse: впереди новые матчи, истории и подробная статистика.</p></div><Link href="/news" className="text-link">← Вернуться к новостям</Link></div><aside className="related-stories"><span className="eyebrow">ЕЩЁ ПО ТЕМЕ</span><h2>Читайте также</h2><div className="related-list">{related.map((item) => <ArticleCard key={item.id} article={item} />)}</div></aside></article></div></main>;
}
