import type { Metadata } from 'next';
import { FavoritesBrowser } from '@/components/favorites-browser';

export const metadata: Metadata = { title: 'Избранное' };

export default function FavoritesPage() {
  return <main className="page-main"><div className="container"><div className="page-hero"><span className="eyebrow">ВАШ ФУТБОЛ</span><h1>Избранное</h1><p>Команды и турниры, за которыми следите, и материалы, которые сохранили.</p></div><FavoritesBrowser /></div></main>;
}
