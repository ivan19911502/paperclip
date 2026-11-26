import Link from 'next/link';
import { Activity, Search } from 'lucide-react';

const links = [
  ['Матчи', '/scores'], ['Новости', '/news'], ['Турниры', '/leagues'], ['Видео', '/videos'],
];

export function SiteHeader() {
  const today = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Minsk' }).format(new Date()).toLocaleUpperCase('ru-RU');
  return <>
    <div className="topline"><div className="container topline-inner"><span>{today}</span><span className="topline-right">ЕВРОПЕЙСКИЙ ФУТБОЛ · 2026/27</span></div></div>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="brand" aria-label="SportPulse — главная"><span className="brand-icon"><Activity size={21} strokeWidth={2.5} /></span><span>SPORT<span className="brand-light">PULSE</span></span></Link>
      <nav className="main-nav" aria-label="Основная навигация">{links.map(([name, href]) => <Link href={href} key={href}>{name}</Link>)}</nav>
      <div className="header-actions"><Link className="search-link" href="/search"><Search size={17} /><span>Поиск</span></Link><Link href="/favorites" className="favorite-link">Избранное</Link><Link href="/admin" className="admin-link">Для редакции ↗</Link></div>
      <div className="mobile-nav">{links.slice(0, 3).map(([name, href]) => <Link href={href} key={href}>{name}</Link>)}</div>
    </div></header>
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-main"><div><Link href="/" className="brand"><span className="brand-icon"><Activity size={20} /></span><span>SPORT<span className="brand-light">PULSE</span></span></Link><p className="footer-copy">Футбол. Истории. Эмоции.<br />Всё самое важное — в одном ритме.</p></div><div className="footer-links"><div><b>На поле</b><Link href="/scores">Матчи и результаты</Link><Link href="/leagues">Турниры</Link><Link href="/teams/premier-league-ars">Команды</Link></div><div><b>На трибуне</b><Link href="/news">Новости</Link><Link href="/videos">Видео</Link><Link href="/favorites">Избранное</Link></div><div><b>Редакция</b><Link href="/admin">Панель редакции</Link><Link href="/search">Поиск по сайту</Link></div></div></div><div className="container footer-bottom"><span>© 2026 SPORTPULSE</span><span>ДЕМО-РЕЖИМ · ДАННЫЕ ДЛЯ ПРЕДПРОСМОТРА</span><a href="#top">НАВЕРХ ↑</a></div></footer>;
}
