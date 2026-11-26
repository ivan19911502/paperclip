import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { homeData } from '@/lib/data';
import { ArticleCard, LeagueTable, MatchTile, SectionHeading } from '@/components/content';
import { VideoCard } from '@/components/sport-ui';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { matches, articles, videos, leagues, standings } = await homeData();
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const storyList = articles.filter((article) => article.id !== featured?.id).slice(0, 3);
  const liveMatches = matches.filter((match) => match.status === 'LIVE' || match.status === 'HALFTIME');
  const scheduledMatches = matches.filter((match) => match.status === 'SCHEDULED' || match.status === 'FINISHED');
  const today = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Minsk' }).format(new Date()).toLocaleUpperCase('ru-RU');

  return <main className="page-main"><div className="container">
    <section className="home-grid">
      <Link href={featured ? `/news/${featured.slug}` : '/news'} className="hero-story" style={{ backgroundImage: featured ? `url('${featured.image}')` : "url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=80')" }}>
        <div className="hero-story-copy"><span className="feature-label">ИСТОРИЯ ДНЯ</span><h1>{featured?.title ?? 'Футбол говорит на языке эмоций'}</h1><p>{featured?.excerpt ?? 'Новости, матчи и большие истории футбольного мира.'}</p><span className="hero-byline"><span>{featured?.author?.[0] ?? 'S'}</span>{featured?.author ?? 'Редакция SportPulse'}<i />{featured ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(featured.publishedAt) : 'Сегодня'}<ArrowRight size={14} /></span></div>
      </Link>
      <aside className="live-panel"><div className="live-panel-heading"><h2>Сейчас на поле</h2><span className="live-pill"><i className="live-dot" />LIVE</span></div><div className="match-list">{liveMatches.length ? liveMatches.slice(0, 4).map((match) => <MatchTile match={match} key={match.id} />) : scheduledMatches.slice(0, 2).map((match) => <MatchTile match={match} key={match.id} />)}</div><Link className="all-matches-link" href="/scores"><span>Все матчи сегодня</span><ChevronRight size={15} /></Link></aside>
    </section>

    <section className="ticker" aria-label="Новости в реальном времени"><span className="ticker-label">КРАТКО</span><i className="ticker-line" /><div className="ticker-items">{articles.slice(0, 3).map((article, index) => <span key={article.id}><b>0{index + 1}</b>{article.title}</span>)}</div></section>

    <section className="home-section"><SectionHeading eyebrow={`СЕГОДНЯ · ${today}`} title="Матчи, за которыми следим" href="/scores" label="Все матчи" /><div className="league-group-matches">{matches.slice(0, 6).map((match) => <MatchTile match={match} key={match.id} />)}</div></section>

    <section className="home-section two-column"><div><SectionHeading eyebrow="ЛЕНТА SPORTPULSE" title="Свежий взгляд на игру" href="/news" label="Вся лента" /><div className="article-grid">{storyList.map((article) => <ArticleCard article={article} key={article.id} />)}</div></div><div><SectionHeading eyebrow="ТАБЛИЦА · АПЛ" title="Верхушка лиги" href="/leagues/premier-league" label="Таблица" /><div className="table-panel"><LeagueTable rows={standings} compact /><Link href="/leagues/premier-league" className="all-matches-link"><span>Полная таблица</span><ChevronRight size={15} /></Link></div></div></section>

    <section className="home-section"><SectionHeading eyebrow="ПОСМОТРЕТЬ" title="Видеомоменты" href="/videos" label="Video Center" /><div className="video-grid">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div></section>

    <section className="home-section"><SectionHeading eyebrow="В ЦЕНТРЕ ВНИМАНИЯ" title="Чем живут турниры" href="/leagues" label="Все турниры" /><div className="league-cards">{leagues.map((league) => <Link className="league-card" key={league.id} href={`/leagues/${league.slug}`}><span>{league.logo}</span><div><b>{league.name}</b><small>{league.country} · {league.season}</small></div><ChevronRight size={16} /></Link>)}</div></section>

    <div className="demo-note"><span>✳</span><p>Демонстрационный режим: матчи и статистика служат для предпросмотра интерфейса и не являются текущими официальными результатами.</p><Link href="/about">О SportPulse <ArrowRight size={13} /></Link></div>
  </div></main>;
}
