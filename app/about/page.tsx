import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ArrowRight, BarChart3, Radio, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'О SportPulse' };

export default function AboutPage() {
  return <main className="page-main"><div className="container"><div className="about-hero"><span className="eyebrow">О ПРОЕКТЕ</span><h1>Футбол —<br /><span>в одном ритме.</span></h1><p>SportPulse соединяет события на поле и истории вокруг него. Это место для тех, кто хочет понимать игру глубже и следить за ней внимательнее.</p><Link className="admin-button about-cta" href="/scores">На матчи <ArrowRight size={15} /></Link></div><div className="about-values"><section><Radio /><b>Быть в моменте</b><p>Матчи, счёт и события турниров — собраны в одном календаре.</p></section><section><Activity /><b>Видеть контекст</b><p>Статистика, таблицы и профили помогают замечать больше, чем счёт.</p></section><section><BarChart3 /><b>Читать игру</b><p>Редакционные истории и видео раскрывают тактику и характер футбола.</p></section><section><ShieldCheck /><b>Доверять данным</b><p>Демо-режим честно обозначает данные предпросмотра и не выдаёт их за официальные результаты.</p></section></div></div></main>;
}
