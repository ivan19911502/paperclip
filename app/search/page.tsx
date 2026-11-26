import type { Metadata } from 'next';
import { SearchBox } from '@/components/sport-ui';

export const metadata: Metadata = { title: 'Поиск' };

export default function SearchPage() {
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">ПОИСК ПО SPORTPULSE</span><h1>Найдите свою историю</h1><p>Клуб, матч, игрок или материал редакции — начните вводить название.</p></div><div className="search-page-top"><SearchBox /></div><div className="search-hints"><span>Популярные запросы</span><b>Арсенал</b><b>Лига чемпионов</b><b>матчи</b></div></div></main>;
}
