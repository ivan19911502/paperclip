'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bookmark, LoaderCircle } from 'lucide-react';
import { EmptyState } from '@/components/sport-ui';

type Item = { id: string; targetId: string; type: string; title: string; href: string; mark: string; kind: string };

export function FavoritesBrowser() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  async function load() {
    setLoading(true);
    try { const response = await fetch('/api/favorites', { cache: 'no-store' }); const json = await response.json(); setItems(json.data ?? []); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function remove(item: Item) {
    await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, targetId: item.targetId }) });
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }
  const visible = filter === 'ALL' ? items : items.filter((item) => item.type === filter);
  const filters = [['ALL', 'Всё'], ['TEAM', 'Команды'], ['LEAGUE', 'Турниры'], ['ARTICLE', 'Новости'], ['VIDEO', 'Видео']];
  return <div className="favorite-layout"><nav className="favorite-types">{filters.map(([key, name]) => <button key={key} onClick={() => setFilter(key)} className={filter === key ? 'active' : ''}>{name}<span>{key === 'ALL' ? items.length : items.filter((item) => item.type === key).length}</span></button>)}</nav><section>{loading ? <div className="loading-state"><LoaderCircle className="spinner-icon" />Загружаем избранное</div> : visible.length ? visible.map((item) => <div className="favorite-row" key={item.id}><span className="favorite-row-mark">{item.mark}</span><Link href={item.href}><strong>{item.title}</strong><span>{item.kind}</span></Link><button className="remove-favorite" onClick={() => remove(item)} aria-label={`Убрать ${item.title} из избранного`}><Bookmark size={17} fill="currentColor" /></button></div>) : <EmptyState title="Пока ничего не сохранено" detail="Нажмите на значок закладки рядом с командой, турниром или новостью — и она появится здесь." />}</section></div>;
}
