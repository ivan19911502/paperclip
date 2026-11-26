import Link from 'next/link';

export default function NotFoundPage() {
  return <main className="page-main"><div className="container"><section className="error-page"><span className="eyebrow">404 · МЯЧ УШЁЛ ЗА ПОЛЕ</span><h1>Такой страницы нет</h1><p>Возможно, ссылка устарела или материал ещё не опубликован.</p><Link className="admin-button" href="/">На главную →</Link></section></div></main>;
}
