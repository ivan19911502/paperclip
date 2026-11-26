'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sportpulse.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? 'Не удалось войти.'); return; }
      router.replace('/admin'); router.refresh();
    } catch { setError('Сервер недоступен. Попробуйте ещё раз.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit}><label>Email<input required type="email" autoComplete="username" className="admin-input" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Пароль<input required type="password" autoComplete="current-password" className="admin-input" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error ? <div className="toast error">{error}</div> : null}<button className="admin-button" disabled={busy}>{busy ? 'Проверяем…' : 'Войти в редакцию →'}</button><small className="login-hint">Демо-данные для входа указаны в README.</small></form>;
}
