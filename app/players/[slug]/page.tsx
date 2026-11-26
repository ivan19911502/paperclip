import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const player = await prisma.player.findUnique({ where: { slug }, select: { name: true } }); return { title: player?.name ?? 'Игрок' };
}

export default async function PlayerPage({ params }: PageProps) {
  const { slug } = await params;
  const player = await prisma.player.findUnique({ where: { slug }, include: { team: { include: { league: true } } } });
  if (!player) notFound();
  const position = { GOALKEEPER: 'Вратарь', DEFENDER: 'Защитник', MIDFIELDER: 'Полузащитник', FORWARD: 'Нападающий' }[player.position];
  return <main className="page-main"><div className="container"><div className="page-hero"><div className="breadcrumb"><Link href="/teams">Команды</Link><span>/</span><Link href={`/teams/${player.team.slug}`}>{player.team.name}</Link><span>/</span>Профиль игрока</div><span className="eyebrow">ИГРОК · {player.team.league?.name}</span></div><section className="player-hero"><div className="player-portrait" style={{ backgroundImage: `url('${player.image}')` }}><b>{String(player.number).padStart(2, '0')}</b></div><div className="player-summary"><span className="eyebrow">{position} · №{player.number}</span><h1>{player.name}</h1><p><Link href={`/teams/${player.team.slug}`}>{player.team.mark} {player.team.name}</Link> · {player.nationality} · {player.age} лет</p><div className="player-stats"><div><b>{player.appearances}</b><span>Матчи</span></div><div><b>{player.goals}</b><span>Голы</span></div><div><b>{player.assists}</b><span>Ассисты</span></div><div><b>{player.yellowCards}</b><span>ЖК</span></div><div><b>{player.redCards}</b><span>КК</span></div></div><div className="player-profile-note"><span className="eyebrow">ПРОФИЛЬ</span><p>{player.name} выступает на позиции «{position.toLowerCase()}» за клуб {player.team.name}. Данные и показатели представлены в демонстрационном режиме SportPulse.</p><Link className="text-link" href={`/teams/${player.team.slug}`}>Страница команды ↗</Link></div></div></section></div></main>;
}
