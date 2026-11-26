'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, FileText, Flag, Film, Goal, LayoutDashboard, LogOut, Plus, ShieldCheck, Users } from 'lucide-react';

type Resource = 'teams' | 'leagues' | 'matches' | 'players' | 'articles' | 'videos';
type RecordItem = Record<string, any> & { id: string };
type Option = { id: string; name: string };
type Field = { key: string; label: string; kind?: 'text' | 'textarea' | 'number' | 'url' | 'checkbox' | 'date' | 'select'; options?: string[]; source?: 'teams' | 'leagues' | 'categories'; required?: boolean; full?: boolean };

const sections: Array<{ id: 'overview' | Resource; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard }, { id: 'articles', label: 'Новости', icon: FileText }, { id: 'matches', label: 'Матчи', icon: Goal }, { id: 'teams', label: 'Команды', icon: ShieldCheck }, { id: 'leagues', label: 'Турниры', icon: Flag }, { id: 'players', label: 'Игроки', icon: Users }, { id: 'videos', label: 'Видео', icon: Film },
];

const fields: Record<Resource, Field[]> = {
  articles: [{ key: 'title', label: 'Заголовок', required: true }, { key: 'slug', label: 'Slug', required: true }, { key: 'excerpt', label: 'Краткое описание', kind: 'textarea', required: true, full: true }, { key: 'body', label: 'Текст статьи', kind: 'textarea', required: true, full: true }, { key: 'image', label: 'URL обложки', kind: 'url', required: true }, { key: 'author', label: 'Автор', required: true }, { key: 'categoryId', label: 'Рубрика', kind: 'select', source: 'categories', required: true }, { key: 'readMinutes', label: 'Минут чтения', kind: 'number' }, { key: 'featured', label: 'Главная история', kind: 'checkbox' }, { key: 'published', label: 'Опубликовано', kind: 'checkbox' }],
  teams: [{ key: 'name', label: 'Название', required: true }, { key: 'slug', label: 'Slug', required: true }, { key: 'shortName', label: 'Короткое название', required: true }, { key: 'mark', label: 'Значок / emoji', required: true }, { key: 'primaryColor', label: 'Основной цвет', required: true }, { key: 'country', label: 'Страна', required: true }, { key: 'leagueId', label: 'Домашний турнир', kind: 'select', source: 'leagues' }],
  leagues: [{ key: 'name', label: 'Название', required: true }, { key: 'slug', label: 'Slug', required: true }, { key: 'country', label: 'Страна', required: true }, { key: 'countryCode', label: 'Код страны', required: true }, { key: 'season', label: 'Сезон', required: true }, { key: 'logo', label: 'Флаг / эмблема', required: true }, { key: 'accent', label: 'Основной цвет', required: true }],
  matches: [{ key: 'slug', label: 'Slug', required: true }, { key: 'leagueId', label: 'Турнир', kind: 'select', source: 'leagues', required: true }, { key: 'homeTeamId', label: 'Хозяева', kind: 'select', source: 'teams', required: true }, { key: 'awayTeamId', label: 'Гости', kind: 'select', source: 'teams', required: true }, { key: 'kickoff', label: 'Начало', kind: 'date', required: true }, { key: 'status', label: 'Статус', kind: 'select', options: ['SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED'], required: true }, { key: 'homeScore', label: 'Счёт хозяев', kind: 'number' }, { key: 'awayScore', label: 'Счёт гостей', kind: 'number' }, { key: 'minute', label: 'Минута', kind: 'number' }, { key: 'round', label: 'Тур' }, { key: 'venue', label: 'Стадион' }],
  players: [{ key: 'name', label: 'Имя', required: true }, { key: 'slug', label: 'Slug', required: true }, { key: 'teamId', label: 'Команда', kind: 'select', source: 'teams', required: true }, { key: 'number', label: 'Номер', kind: 'number', required: true }, { key: 'position', label: 'Позиция', kind: 'select', options: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'], required: true }, { key: 'age', label: 'Возраст', kind: 'number', required: true }, { key: 'nationality', label: 'Гражданство', required: true }, { key: 'image', label: 'URL фото', kind: 'url', required: true }, { key: 'appearances', label: 'Матчи', kind: 'number' }, { key: 'goals', label: 'Голы', kind: 'number' }, { key: 'assists', label: 'Ассисты', kind: 'number' }, { key: 'yellowCards', label: 'Жёлтые карточки', kind: 'number' }, { key: 'redCards', label: 'Красные карточки', kind: 'number' }],
  videos: [{ key: 'title', label: 'Название', required: true }, { key: 'slug', label: 'Slug', required: true }, { key: 'description', label: 'Описание', kind: 'textarea', required: true, full: true }, { key: 'thumbnail', label: 'URL превью', kind: 'url', required: true }, { key: 'duration', label: 'Длительность (мм:сс)', required: true }, { key: 'category', label: 'Категория', required: true }, { key: 'videoUrl', label: 'URL плеера', kind: 'url', required: true }],
};

const resourceLabels: Record<Resource, string> = { articles: 'Новости', matches: 'Матчи', teams: 'Команды', leagues: 'Турниры', players: 'Игроки', videos: 'Видео' };
const slugify = (value: string) => { const letters: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }; return [...value.normalize('NFKD').toLowerCase()].map((character) => letters[character] ?? character).join('').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
const sourceValue = (item: RecordItem) => item.title ?? item.name ?? (item.homeTeam ? `${item.homeTeam.shortName} — ${item.awayTeam.shortName}` : item.id);

export function AdminWorkspace() {
  const router = useRouter();
  const [active, setActive] = useState<'overview' | Resource>('overview');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [counts, setCounts] = useState<Record<Resource, number>>({ articles: 0, matches: 0, teams: 0, leagues: 0, players: 0, videos: 0 });
  const [lookups, setLookups] = useState<Record<string, Option[]>>({ teams: [], leagues: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<RecordItem | null | undefined>(undefined);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/teams?limit=250').then((r) => r.json()).then((j) => setLookups((s) => ({ ...s, teams: j.data?.map((x: any) => ({ id: x.id, name: x.name })) ?? [] }))).catch(() => {});
    fetch('/api/leagues?limit=250').then((r) => r.json()).then((j) => setLookups((s) => ({ ...s, leagues: j.data?.map((x: any) => ({ id: x.id, name: x.name })) ?? [] }))).catch(() => {});
    fetch('/api/categories').then((r) => r.json()).then((j) => setLookups((s) => ({ ...s, categories: j.data?.map((x: any) => ({ id: x.id, name: x.name })) ?? [] }))).catch(() => {});
    for (const resource of Object.keys(resourceLabels) as Resource[]) fetch(`/api/${resource}?limit=250`).then((r) => r.json()).then((j) => setCounts((s) => ({ ...s, [resource]: j.total ?? j.data?.length ?? 0 }))).catch(() => {});
  }, []);

  useEffect(() => { if (active !== 'overview') void loadResource(active); }, [active]);
  async function loadResource(resource: Resource) {
    setLoading(true); setError('');
    try { const response = await fetch(`/api/${resource}?limit=250`, { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setRecords(result.data ?? []); setCounts((state) => ({ ...state, [resource]: result.total ?? result.data?.length ?? 0 })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Не удалось загрузить список.'); }
    finally { setLoading(false); }
  }
  async function remove(item: RecordItem) {
    if (!window.confirm(`Удалить «${sourceValue(item)}»?`)) return;
    const response = await fetch(`/api/${active}/${item.id}`, { method: 'DELETE' }); const result = await response.json();
    if (!response.ok) { setError(result.error ?? 'Не удалось удалить запись.'); return; }
    setRecords((current) => current.filter((row) => row.id !== item.id)); setCounts((current) => ({ ...current, [active as Resource]: Math.max(0, current[active as Resource] - 1) })); setNotice('Запись удалена.'); setTimeout(() => setNotice(''), 2500);
  }
  async function save(value: Record<string, any>) {
    const resource = active as Resource;
    const editingId = editing?.id;
    const response = await fetch(editingId ? `/api/${resource}/${editingId}` : `/api/${resource}`, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Не удалось сохранить запись.');
    setEditing(undefined); await loadResource(resource); setNotice(editingId ? 'Изменения сохранены.' : 'Запись создана.'); setTimeout(() => setNotice(''), 2500);
  }
  async function logout() { await fetch('/api/session', { method: 'DELETE' }); router.replace('/admin/login'); router.refresh(); }
  const visibleRecords = useMemo(() => records.filter((item) => sourceValue(item).toLocaleLowerCase().includes(search.toLocaleLowerCase())), [records, search]);

  return <div className="admin-shell"><aside className="admin-sidebar"><strong>Control room</strong>{sections.map(({ id, label, icon: Icon }) => <button className={active === id ? 'active' : ''} key={id} onClick={() => { setSearch(''); setActive(id); }}><Icon size={15} />{label}{id !== 'overview' ? <small>{counts[id]}</small> : null}</button>)}<button className="admin-logout" onClick={logout}><LogOut size={14} />Выйти</button></aside><section className="admin-content">{active === 'overview' ? <><span className="eyebrow">РАБОЧИЙ СТОЛ</span><h2>С возвращением</h2><p>Контент и данные SportPulse в одном месте.</p>{notice ? <div className="toast">{notice}</div> : null}<div className="admin-stats">{sections.filter((item) => item.id !== 'overview').map((item) => <button className="admin-stat" key={item.id} onClick={() => setActive(item.id)}><b>{counts[item.id as Resource]}</b><span>{item.label}</span></button>)}</div><div className="admin-welcome"><span className="admin-welcome-icon"><Activity /></span><div><b>Редакторский центр готов к работе</b><p>Создавайте публикации, обновляйте результаты и поддерживайте справочник турниров в актуальном состоянии.</p></div><button className="admin-button" onClick={() => setActive('articles')}><Plus size={14} />Новая статья</button></div><div className="admin-quick-links">{sections.slice(1).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActive(id)}><Icon size={16} /><span>{label}</span><b>Открыть →</b></button>)}</div></> : <><div className="admin-section-heading"><div><span className="eyebrow">УПРАВЛЕНИЕ КОНТЕНТОМ</span><h2>{resourceLabels[active]}</h2><p>{counts[active]} записей в каталоге</p></div><button className="admin-button" onClick={() => setEditing(null)}><Plus size={14} />Добавить</button></div>{notice ? <div className="toast">{notice}</div> : null}{error ? <div className="toast error">{error}</div> : null}<div className="admin-toolbar"><input className="admin-input admin-search" placeholder="Поиск по списку" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="admin-button secondary" onClick={() => void loadResource(active)}>Обновить ↻</button></div>{loading ? <p className="muted-copy">Загружаем данные…</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Название</th><th>Статус / детали</th><th>Дата</th><th></th></tr></thead><tbody>{visibleRecords.map((item) => <tr key={item.id}><td><b>{sourceValue(item)}</b><small>{item.slug ?? item.id}</small></td><td>{item.status ?? item.category?.name ?? item.league?.name ?? item.team?.name ?? (item.published === false ? 'Черновик' : 'Опубликовано')}</td><td>{item.kickoff ? new Date(item.kickoff).toLocaleDateString('ru-RU') : item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ru-RU') : '—'}</td><td><div className="admin-actions"><button onClick={() => setEditing(item)}>Изменить</button><button className="danger" onClick={() => void remove(item)}>Удалить</button></div></td></tr>)}</tbody></table>{visibleRecords.length ? null : <div className="empty-state"><span>✳</span><h3>Список пока пуст</h3><p>Добавьте первую запись или измените поисковый запрос.</p></div>}</div>}</> }</section>{active !== 'overview' && editing !== undefined ? <ResourceForm resource={active} current={editing} lookups={lookups} onClose={() => setEditing(undefined)} onSave={save} /> : null}</div>;
}

function ResourceForm({ resource, current, lookups, onClose, onSave }: { resource: Resource; current: RecordItem | null; lookups: Record<string, Option[]>; onClose: () => void; onSave: (value: Record<string, any>) => Promise<void> }) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const field of fields[resource]) {
      const value = current?.[field.key];
      if (field.kind === 'checkbox') initial[field.key] = value ?? (field.key === 'published');
      else if (field.kind === 'date') initial[field.key] = value ? new Date(value).toISOString().slice(0, 16) : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
      else if (field.kind === 'number') initial[field.key] = value ?? (field.key === 'readMinutes' ? 4 : field.key === 'number' ? 1 : 0);
      else if (field.key === 'status') initial[field.key] = value ?? 'SCHEDULED';
      else initial[field.key] = value ?? '';
    }
    if (!current) {
      if (resource === 'teams') { initial.shortName = 'FC'; initial.mark = '⚽'; initial.primaryColor = '#c4f24f'; initial.country = 'Англия'; }
      if (resource === 'leagues') { initial.countryCode = 'UEFA'; initial.season = '2026/27'; initial.logo = '🏆'; initial.accent = '#c4f24f'; }
      if (resource === 'players') { initial.position = 'MIDFIELDER'; initial.age = 22; initial.nationality = 'Англия'; initial.image = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=75'; }
      if (resource === 'articles') { initial.author = 'Редакция SportPulse'; initial.image = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1440&q=80'; initial.body = 'Добавьте текст материала. Используйте пустую строку для разделения абзацев.'; }
      if (resource === 'videos') { initial.duration = '08:42'; initial.category = 'Хайлайты'; initial.thumbnail = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80'; initial.videoUrl = 'https://www.youtube.com/embed/ScMzIvxBSi4'; initial.description = 'Краткое описание видеоматериала.'; }
    }
    return initial;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function setField(key: string, value: any) {
    setValues((old) => {
      const next = { ...old, [key]: value };
      const nameField = resource === 'articles' || resource === 'videos' ? 'title' : 'name';
      if (key === nameField && !current) next.slug = slugify(String(value));
      return next;
    });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const output: Record<string, any> = {};
    for (const field of fields[resource]) {
      const value = values[field.key];
      if (field.kind === 'checkbox') output[field.key] = Boolean(value);
      else if (field.kind === 'number') output[field.key] = value === '' || value === null ? null : Number(value);
      else if (field.kind === 'date') output[field.key] = new Date(value).toISOString();
      else if (value !== '' || field.required) output[field.key] = value || null;
    }
    if (resource === 'matches' && output.homeTeamId === output.awayTeamId) { setError('Команды матча должны отличаться.'); setBusy(false); return; }
    try { await onSave(output); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Не удалось сохранить запись.'); } finally { setBusy(false); }
  }
  return <dialog open className="admin-form-dialog"><form onSubmit={submit}><span className="eyebrow">{current ? 'ИЗМЕНЕНИЕ' : 'НОВАЯ ЗАПИСЬ'}</span><h3>{current ? 'Редактировать' : 'Создать'} · {resourceLabels[resource]}</h3>{error ? <div className="toast error">{error}</div> : null}<div className="admin-form-grid">{fields[resource].map((field) => <label key={field.key} className={`admin-form-field ${field.full ? 'full' : ''}`}>{field.kind === 'checkbox' ? <span className="checkbox-label"><input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => setField(field.key, event.target.checked)} />{field.label}</span> : <>{field.label}{field.kind === 'textarea' ? <textarea required={field.required} className="admin-textarea" value={values[field.key]} onChange={(event) => setField(field.key, event.target.value)} /> : field.kind === 'select' ? <select required={field.required} className="admin-select" value={values[field.key]} onChange={(event) => setField(field.key, event.target.value)}><option value="">Выберите…</option>{(field.options ?? lookups[field.source ?? '']?.map((item) => item.id) ?? []).map((option) => { const found = field.source ? lookups[field.source]?.find((item) => item.id === option) : undefined; return <option value={option} key={option}>{found?.name ?? option}</option>; })}</select> : <input required={field.required} type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'datetime-local' : field.kind === 'url' ? 'url' : 'text'} className="admin-input" min={field.kind === 'number' ? '0' : undefined} value={values[field.key]} onChange={(event) => setField(field.key, field.kind === 'number' ? event.target.value : event.target.value)} />}</>}</label>)}</div><div className="admin-form-footer"><button type="button" className="admin-button secondary" onClick={onClose}>Отмена</button><button className="admin-button" disabled={busy}>{busy ? 'Сохраняем…' : current ? 'Сохранить' : 'Создать запись'}</button></div></form></dialog>;
}
