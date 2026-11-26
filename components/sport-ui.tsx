'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bookmark, Search, Play, X } from 'lucide-react';

export function FavoriteButton({ type, targetId, initial = false, label }: { type: 'TEAM' | 'LEAGUE' | 'ARTICLE' | 'VIDEO'; targetId: string; initial?: boolean; label?: string }) {
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetch('/api/favorites').then((response) => response.json()).then((result) => {
      if (mounted && Array.isArray(result.data)) setSaved(result.data.some((item: { type: string; targetId: string }) => item.type === type && item.targetId === targetId));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [type, targetId]);
  async function toggle() {
    setBusy(true);
    try {
      const response = await fetch('/api/favorites', { method: saved ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, targetId }) });
      if (response.ok) setSaved(!saved);
    } finally { setBusy(false); }
  }
  return <button className={`save-button ${saved ? 'is-saved' : ''}`} aria-pressed={saved} aria-label={label ?? (saved ? 'Убрать из избранного' : 'Добавить в избранное')} disabled={busy} onClick={toggle}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />{label ? <span>{saved ? 'В избранном' : label}</span> : null}</button>;
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; title: string; href: string; kind: string }>>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try { const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: abort.signal }); const json = await response.json(); setResults(json.data ?? []); setOpen(true); } catch {}
    }, 160);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [query]);
  return <div className="search-box"><Search size={17} /><input autoFocus placeholder="Матч, клуб, игрок или новость" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setOpen(true)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); if (event.key === 'Enter' && results[0]) window.location.href = results[0].href; }} /><kbd>ESC</kbd>
    {open && query.trim().length >= 2 ? <div className="search-results">{results.length ? results.map((result) => <Link onClick={() => setOpen(false)} href={result.href} key={`${result.kind}-${result.id}`}><span>{result.title}</span><small>{result.kind}</small></Link>) : <p>Ничего не найдено. Попробуйте другое название.</p>}<button onClick={() => setOpen(false)} aria-label="Закрыть результаты"><X size={15} /></button></div> : null}
  </div>;
}

export function VideoPlayer({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="video-modal" role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={onClose} aria-label="Закрыть"><X /></button><div className="video-frame"><iframe src={url} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div><h2>{title}</h2><p>Демонстрационный видеоплеер SportPulse</p></section></div>;
}

export function VideoCard({ video, featured = false }: { video: { id: string; slug: string; title: string; description: string; thumbnail: string; duration: string; category: string; videoUrl: string }; featured?: boolean }) {
  const [playing, setPlaying] = useState(false);
  return <><button className={`video-card ${featured ? 'video-card-featured' : ''}`} onClick={() => setPlaying(true)}><span className="video-thumb" style={{ backgroundImage: `linear-gradient(180deg,transparent 28%,rgba(4,8,6,.86)),url('${video.thumbnail}')` }}><span className="play-button"><Play size={17} fill="currentColor" /></span><span className="video-duration">{video.duration}</span></span><span className="video-copy"><small>{video.category}</small><strong>{video.title}</strong><span>{video.description}</span></span></button>{playing ? <VideoPlayer title={video.title} url={video.videoUrl} onClose={() => setPlaying(false)} /> : null}</>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><span>✳</span><h3>{title}</h3><p>{detail}</p></div>;
}
