import type { Metadata } from 'next';
import './globals.css';
import { SiteFooter, SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: { default: 'SportPulse — футбол в одном ритме', template: '%s · SportPulse' },
  description: 'Футбольные новости, live-результаты, матчи и таблицы главных европейских турниров.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body id="top"><SiteHeader />{children}<SiteFooter /></body></html>;
}
