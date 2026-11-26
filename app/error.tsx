'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="page-main"><div className="container"><section className="error-page"><span className="eyebrow">ЧТО-ТО ПОШЛО НЕ ТАК</span><h1>Игра на паузе</h1><p>Не удалось загрузить эту страницу. Попробуйте ещё раз через несколько секунд.</p><button className="admin-button" onClick={reset}>Повторить попытку ↻</button></section></div></main>;
}
