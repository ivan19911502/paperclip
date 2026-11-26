import { PrismaClient, PlayerPosition, MatchStatus, EventType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const competitions = [
  { slug: 'premier-league', name: 'Premier League', country: 'Англия', code: 'ENG', logo: '🏴', accent: '#8b5cf6', teams: [['Арсенал', 'ARS', '🔴', '#ef4444'], ['Манчестер Сити', 'MCI', '🔵', '#38bdf8'], ['Ливерпуль', 'LIV', '🔴', '#ef4444'], ['Тоттенхэм', 'TOT', '⚪', '#e2e8f0'], ['Челси', 'CHE', '🔵', '#3b82f6'], ['Манчестер Юнайтед', 'MUN', '🔴', '#dc2626'], ['Ньюкасл', 'NEW', '⚫', '#e5e7eb'], ['Астон Вилла', 'AVL', '🟣', '#a855f7']] },
  { slug: 'la-liga', name: 'La Liga', country: 'Испания', code: 'ESP', logo: '🇪🇸', accent: '#f97316', teams: [['Реал Мадрид', 'RMA', '⚪', '#e2e8f0'], ['Барселона', 'BAR', '🔵', '#3b82f6'], ['Атлетико Мадрид', 'ATM', '🔴', '#ef4444'], ['Жирона', 'GIR', '🔴', '#ef4444'], ['Реал Сосьедад', 'RSO', '🔵', '#38bdf8'], ['Атлетик Бильбао', 'ATH', '🔴', '#dc2626'], ['Бетис', 'BET', '🟢', '#22c55e'], ['Валенсия', 'VAL', '⚪', '#e5e7eb']] },
  { slug: 'serie-a', name: 'Serie A', country: 'Италия', code: 'ITA', logo: '🇮🇹', accent: '#3b82f6', teams: [['Интер', 'INT', '🔵', '#3b82f6'], ['Милан', 'MIL', '🔴', '#ef4444'], ['Ювентус', 'JUV', '⚫', '#e5e7eb'], ['Наполи', 'NAP', '🔵', '#38bdf8'], ['Рома', 'ROM', '🟠', '#f97316'], ['Лацио', 'LAZ', '🩵', '#38bdf8'], ['Аталанта', 'ATA', '🔵', '#2563eb'], ['Болонья', 'BOL', '🔴', '#ef4444']] },
  { slug: 'bundesliga', name: 'Bundesliga', country: 'Германия', code: 'GER', logo: '🇩🇪', accent: '#ef4444', teams: [['Бавария', 'BAY', '🔴', '#ef4444'], ['Боруссия Дортмунд', 'BVB', '🟡', '#facc15'], ['Байер Леверкузен', 'LEV', '🔴', '#dc2626'], ['РБ Лейпциг', 'RBL', '🔴', '#ef4444'], ['Штутгарт', 'STU', '⚪', '#e5e7eb'], ['Айнтрахт', 'SGE', '⚫', '#e5e7eb'], ['Фрайбург', 'SCF', '⚫', '#e5e7eb'], ['Унион Берлин', 'UNB', '🔴', '#ef4444']] },
  { slug: 'ligue-1', name: 'Ligue 1', country: 'Франция', code: 'FRA', logo: '🇫🇷', accent: '#38bdf8', teams: [['Пари Сен-Жермен', 'PSG', '🔵', '#3b82f6'], ['Монако', 'MON', '🔴', '#ef4444'], ['Марсель', 'OM', '🔵', '#38bdf8'], ['Лилль', 'LIL', '🔴', '#ef4444'], ['Лион', 'LYO', '🔴', '#dc2626'], ['Ренн', 'REN', '🔴', '#ef4444'], ['Ницца', 'NIC', '🔴', '#dc2626'], ['Ланс', 'LEN', '🟡', '#facc15']] },
  { slug: 'champions-league', name: 'Champions League', country: 'Европа', code: 'UEFA', logo: '⭐', accent: '#6366f1', teams: [] },
];

const articleSeeds = [
  { slug: 'arsenal-title-race', title: 'Гонка за титул становится жарче с каждым туром', excerpt: 'Лидеры чемпионата снова теряют очки — интрига в верхней части таблицы сохраняется до последних туров.', category: 'АПЛ', image: 'photo-1522778119026-d647f0596c20', featured: true, author: 'Алексей Морозов', body: 'Сезон входит в решающую фазу, а плотность результатов превращает каждый матч в отдельную историю. Команды научились адаптироваться к разным сценариям и меняют темп прямо по ходу игры. Впереди серия встреч, которая может определить весь чемпионат.' },
  { slug: 'champions-league-night', title: 'Европейские вечера: кто готов к большому шагу', excerpt: 'Новый игровой цикл Лиги чемпионов обещает вывески, достойные финала.', category: 'Лига чемпионов', image: 'photo-1508098682722-e99c43a406b2', featured: false, author: 'Мария Кузнецова', body: 'Континентальный турнир снова объединяет разные футбольные школы. Скорость английских клубов встретится с испанским контролем мяча, а немецкий прессинг проверит европейских грандов на прочность.' },
  { slug: 'young-stars', title: 'Новое поколение уже меняет правила игры', excerpt: 'Молодые таланты всё чаще становятся ключевыми фигурами в больших матчах.', category: 'Аналитика', image: 'photo-1517466787929-bc90951d0974', featured: false, author: 'Денис Волков', body: 'Тренерские штабы всё охотнее доверяют юным игрокам важные роли. Дело не только в скорости: новое поколение лучше понимает пространство и быстрее принимает решения под давлением.' },
  { slug: 'derby-weekend', title: 'Дерби выходных: форма команд, факты и ожидания', excerpt: 'Городские соперники встречаются в момент, когда цена ошибки особенно высока.', category: 'Перед матчем', image: 'photo-1522778119026-d647f0596c20', featured: false, author: 'Илья Соколов', body: 'Дерби редко подчиняются логике таблицы. История противостояния, детали подготовки и атмосфера трибун могут оказаться важнее текущей формы.' },
  { slug: 'tactics-pressing', title: 'Как высокий прессинг стал языком современного футбола', excerpt: 'Разбираем, почему смелое давление работает даже против сильнейших соперников.', category: 'Тактика', image: 'photo-1489944440615-453fc2b6a9a9', featured: false, author: 'Олег Миронов', body: 'Высокий прессинг — это не просто бег вперёд. Это согласованные триггеры, закрытые линии передач и понимание, где соперник предпочитает начинать атаку.' },
  { slug: 'transfer-window', title: 'Трансферный рынок: команды ищут баланс', excerpt: 'Клубы точечно усиливают позиции перед напряжённым отрезком сезона.', category: 'Трансферы', image: 'photo-1521412644187-c49fa049e84d', featured: false, author: 'Анна Романова', body: 'Удачный трансфер — это не только громкое имя. Клубы оценивают профиль игрока, его роль в системе и возможность быстро адаптироваться к новой лиге.' },
];

const names = ['Лукас', 'Матео', 'Александр', 'Даниэль', 'Никита', 'Рафаэль', 'Тео', 'Энцо', 'Марк', 'Илья', 'Хави', 'Лео'];
const surnames = ['Ромеро', 'Силва', 'Морено', 'Вега', 'Коста', 'Новак', 'Фернандес', 'Гарсия', 'Петров', 'Мартинес', 'Райт', 'Коваль'];
const playerPositions = [PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER, PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD];
const photoIds = ['photo-1500648767791-00dcc994a43e', 'photo-1506794778202-cad84cf45f1d', 'photo-1507003211169-0a1dd7228f2d', 'photo-1535713875002-d1d0cf377fde'];

async function main() {
  const leagueBySlug = new Map<string, string>();
  const teamIdsByLeague = new Map<string, string[]>();
  let globalTeamIndex = 0;

  for (const comp of competitions) {
    const league = await prisma.league.upsert({
      where: { slug: comp.slug },
      update: { name: comp.name, country: comp.country, countryCode: comp.code, season: '2026/27', logo: comp.logo, accent: comp.accent },
      create: { slug: comp.slug, name: comp.name, country: comp.country, countryCode: comp.code, season: '2026/27', logo: comp.logo, accent: comp.accent },
    });
    leagueBySlug.set(comp.slug, league.id);
    const teamIds: string[] = [];

    for (const [teamIndex, [name, shortName, mark, primaryColor]] of comp.teams.entries()) {
      const slug = `${comp.slug}-${shortName.toLowerCase()}`;
      const team = await prisma.team.upsert({
        where: { slug },
        update: { name, shortName, mark, primaryColor, country: comp.country, leagueId: league.id },
        create: { slug, name, shortName, mark, primaryColor, country: comp.country, leagueId: league.id },
      });
      teamIds.push(team.id);
      const played = 20;
      const won = Math.max(1, 15 - teamIndex);
      const drawn = 1 + (teamIndex % 4);
      const standingValues = { played, won, drawn, lost: played - won - drawn, goalsFor: 44 - teamIndex * 3, goalsAgainst: 14 + teamIndex * 4, points: won * 3 + drawn };
      await prisma.standing.upsert({ where: { leagueId_teamId: { leagueId: league.id, teamId: team.id } }, update: standingValues, create: { leagueId: league.id, teamId: team.id, ...standingValues } });

      if (comp.slug !== 'champions-league') {
        for (let playerIndex = 0; playerIndex < 16; playerIndex++) {
          const position = playerPositions[playerIndex % playerPositions.length];
          const playerSlug = `${slug}-player-${playerIndex + 1}`;
          await prisma.player.upsert({
            where: { slug: playerSlug },
            update: { teamId: team.id },
            create: {
              slug: playerSlug,
              name: `${names[(globalTeamIndex + playerIndex) % names.length]} ${surnames[(globalTeamIndex * 3 + playerIndex) % surnames.length]}`,
              number: playerIndex + 1,
              position,
              age: 19 + ((globalTeamIndex + playerIndex * 2) % 15),
              nationality: comp.country,
              image: `https://images.unsplash.com/${photoIds[(globalTeamIndex + playerIndex) % photoIds.length]}?auto=format&fit=crop&w=420&q=75`,
              appearances: Math.max(1, 15 - playerIndex),
              goals: position === PlayerPosition.FORWARD ? 3 + ((globalTeamIndex + playerIndex) % 10) : position === PlayerPosition.MIDFIELDER ? (globalTeamIndex + playerIndex) % 5 : 0,
              assists: position === PlayerPosition.FORWARD || position === PlayerPosition.MIDFIELDER ? (globalTeamIndex + playerIndex) % 7 : 0,
              yellowCards: (globalTeamIndex + playerIndex) % 4,
              redCards: playerIndex % 9 === 0 ? 1 : 0,
              teamId: team.id,
            },
          });
        }
      }
      globalTeamIndex++;
    }
    teamIdsByLeague.set(comp.slug, teamIds);
  }

  const championsLeagueId = leagueBySlug.get('champions-league')!;
  const championsLeagueTeams = [
    teamIdsByLeague.get('premier-league')![0], teamIdsByLeague.get('premier-league')![1],
    teamIdsByLeague.get('la-liga')![0], teamIdsByLeague.get('la-liga')![1],
    teamIdsByLeague.get('serie-a')![0], teamIdsByLeague.get('serie-a')![2],
    teamIdsByLeague.get('bundesliga')![0], teamIdsByLeague.get('bundesliga')![2],
  ];
  for (const [index, teamId] of championsLeagueTeams.entries()) {
    const won = Math.max(0, 4 - Math.floor(index / 2));
    const drawn = index % 3 === 0 ? 1 : 0;
    const standingValues = { played: 5, won, drawn, lost: 5 - won - drawn, goalsFor: 13 - index, goalsAgainst: 4 + index, points: won * 3 + drawn };
    await prisma.standing.upsert({ where: { leagueId_teamId: { leagueId: championsLeagueId, teamId } }, update: standingValues, create: { leagueId: championsLeagueId, teamId, ...standingValues } });
  }

  const now = new Date();
  const todayAt = (hourOffset: number, dayOffset = 0) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hourOffset, 0, 0);
  const matchSeeds: Array<{ slug: string; league: string; home: number; away: number; offset: number; dayOffset?: number; status: MatchStatus; hs: number | null; as: number | null; minute: number | null; teamIds?: string[] }> = [];
  for (const comp of competitions) {
    if (comp.slug === 'champions-league') {
      const participating = [
        teamIdsByLeague.get('premier-league')![0], teamIdsByLeague.get('premier-league')![1],
        teamIdsByLeague.get('la-liga')![0], teamIdsByLeague.get('la-liga')![1],
        teamIdsByLeague.get('serie-a')![0], teamIdsByLeague.get('serie-a')![2],
        teamIdsByLeague.get('bundesliga')![0], teamIdsByLeague.get('bundesliga')![2],
      ];
      for (let i = 0; i < 4; i++) matchSeeds.push({ slug: `ucl-matchday-${i + 1}`, league: comp.slug, home: i, away: 7 - i, offset: 18 + i, status: i === 0 ? MatchStatus.LIVE : MatchStatus.SCHEDULED, hs: i === 0 ? 1 : null, as: i === 0 ? 0 : null, minute: i === 0 ? 63 : null, teamIds: participating });
      continue;
    }
    const matchSet = [
      { home: 0, away: 1, offset: 18, status: MatchStatus.LIVE, hs: 2, as: 1, minute: 68 },
      { home: 2, away: 3, offset: 20, status: MatchStatus.HALFTIME, hs: 1, as: 1, minute: 45 },
      { home: 4, away: 5, offset: 16, status: MatchStatus.FINISHED, hs: 2, as: 0, minute: null },
      { home: 6, away: 7, offset: 21, status: MatchStatus.SCHEDULED, hs: null, as: null, minute: null },
    ];
    for (const [i, fixture] of matchSet.entries()) matchSeeds.push({ slug: `${comp.slug}-round-${14 + i}`, league: comp.slug, dayOffset: 0, ...fixture });
    matchSeeds.push({ slug: `${comp.slug}-round-13`, league: comp.slug, home: 1, away: 6, offset: 18, dayOffset: -1, status: MatchStatus.FINISHED, hs: 1, as: 1, minute: null });
    matchSeeds.push({ slug: `${comp.slug}-round-15`, league: comp.slug, home: 5, away: 2, offset: 19, dayOffset: 1, status: MatchStatus.SCHEDULED, hs: null, as: null, minute: null });
  }

  for (const [index, seed] of matchSeeds.entries()) {
    const leagueId = leagueBySlug.get(seed.league)!;
    const teams = seed.teamIds ?? teamIdsByLeague.get(seed.league)!;
    const homeTeamId = teams[seed.home];
    const awayTeamId = teams[seed.away];
    const match = await prisma.match.upsert({
      where: { slug: seed.slug },
      update: { leagueId, homeTeamId, awayTeamId, kickoff: todayAt(seed.offset, seed.dayOffset), status: seed.status, homeScore: seed.hs, awayScore: seed.as, minute: seed.minute },
      create: { slug: seed.slug, leagueId, homeTeamId, awayTeamId, kickoff: todayAt(seed.offset, seed.dayOffset), status: seed.status, homeScore: seed.hs, awayScore: seed.as, minute: seed.minute, round: `Тур ${seed.dayOffset === -1 ? 13 : seed.dayOffset === 1 ? 15 : 14 + index % 4}`, venue: 'Национальный стадион', homeFormation: '4-3-3', awayFormation: '4-2-3-1', stats: { possession: [54, 46], shots: [13, 9], shotsOnTarget: [6, 4], corners: [5, 3], fouls: [10, 12] } },
    });
    if (seed.status === MatchStatus.LIVE || seed.status === MatchStatus.HALFTIME || seed.status === MatchStatus.FINISHED) {
      await prisma.matchEvent.upsert({ where: { id: `seed-event-${seed.slug}-goal` }, update: {}, create: { id: `seed-event-${seed.slug}-goal`, matchId: match.id, minute: 34, type: EventType.GOAL, teamId: homeTeamId, playerName: 'Лукас Ромеро', detail: 'Гол' } }).catch(async () => prisma.matchEvent.create({ data: { matchId: match.id, minute: 34, type: EventType.GOAL, teamId: homeTeamId, playerName: 'Лукас Ромеро', detail: 'Гол' } }));
      await prisma.matchEvent.upsert({ where: { id: `seed-event-${seed.slug}-yellow` }, update: {}, create: { id: `seed-event-${seed.slug}-yellow`, matchId: match.id, minute: 51, type: EventType.YELLOW_CARD, teamId: awayTeamId, playerName: 'Матео Силва', detail: 'Жёлтая карточка' } }).catch(async () => prisma.matchEvent.create({ data: { matchId: match.id, minute: 51, type: EventType.YELLOW_CARD, teamId: awayTeamId, playerName: 'Матео Силва', detail: 'Жёлтая карточка' } }));
    }
  }

  for (const categoryName of ['АПЛ', 'Лига чемпионов', 'Аналитика', 'Перед матчем', 'Тактика', 'Трансферы']) {
    const slug = categoryName.toLowerCase().replaceAll(' ', '-');
    await prisma.category.upsert({ where: { slug }, update: { name: categoryName }, create: { slug, name: categoryName } });
  }

  for (const article of articleSeeds) {
    const category = await prisma.category.findFirstOrThrow({ where: { name: article.category } });
    const image = article.image;
    const articleData = { slug: article.slug, title: article.title, excerpt: article.excerpt, body: article.body, author: article.author, featured: article.featured };
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: { title: articleData.title, excerpt: articleData.excerpt, body: articleData.body, image: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1440&q=80`, featured: articleData.featured },
      create: { ...articleData, image: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1440&q=80`, categoryId: category.id, readMinutes: 4, publishedAt: new Date(now.getTime() - articleSeeds.indexOf(article) * 3_600_000) },
    });
  }

  const videos = [
    ['weekend-goals', 'Все голы большого футбольного уик-энда', 'Обзор самых красивых голов и ключевых эпизодов тура.', 'Матчи недели', 'photo-1508098682722-e99c43a406b2', '08:42', 'https://www.youtube.com/embed/ScMzIvxBSi4'],
    ['tactical-board', 'Тактическая доска: прессинг нового поколения', 'Разбираем механизмы высокого прессинга и выход из-под давления.', 'Разборы', 'photo-1489944440615-453fc2b6a9a9', '12:16', 'https://www.youtube.com/embed/LXb3EKWsInQ'],
    ['stadium-stories', 'Атмосфера большого европейского вечера', 'Футбол начинается задолго до стартового свистка.', 'Закулисье', 'photo-1522778119026-d647f0596c20', '06:34', 'https://www.youtube.com/embed/aqz-KE-bpKQ'],
    ['wonder-goals', 'Лучшие дальние удары месяца', 'Подборка точных ударов с дальней дистанции.', 'Хайлайты', 'photo-1517466787929-bc90951d0974', '05:49', 'https://www.youtube.com/embed/ysz5S6PUM-U'],
  ];
  for (const [slug, title, description, category, image, duration, videoUrl] of videos) {
    await prisma.video.upsert({ where: { slug }, update: { title, description }, create: { slug, title, description, category, duration, videoUrl, thumbnail: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1000&q=80` } });
  }

  const email = process.env.ADMIN_EMAIL ?? 'admin@sportpulse.local';
  const password = process.env.ADMIN_PASSWORD ?? 'PulseAdmin2026!';
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({ where: { email }, update: { name: 'Редакция SportPulse', role: UserRole.ADMIN, passwordHash }, create: { email, name: 'Редакция SportPulse', role: UserRole.ADMIN, passwordHash } });

  console.log(`Seeded ${competitions.length} competitions, ${globalTeamIndex} teams, ${articleSeeds.length} articles, ${videos.length} videos.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
