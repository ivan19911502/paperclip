# SportPulse

Футбольная медиаплатформа с новостями, таблицами и календарём матчей, страницами команд и игроков, Video Center, поиском, избранным и защищённой редакционной панелью. Интерфейс по умолчанию на русском языке.

> В комплект входят демонстрационные матчи и статистика. Они показывают работу интерфейса, но не являются текущими официальными результатами. Для реальных live-данных подключите провайдера в адаптерном слое.

## Быстрый старт

Требуются Node.js 20+, npm 9+ и PostgreSQL 16+.

```bash
cp .env.example .env
```

В `.env` укажите доступ к PostgreSQL и случайный `SESSION_SECRET` длиной не менее 32 символов. Создайте базу и роль, соответствующие `DATABASE_URL`, затем:

Для локального PostgreSQL можно создать их так (задайте такой же пароль в `DATABASE_URL`):

```bash
sudo -u postgres psql -c "CREATE ROLE sportpulse LOGIN CREATEDB PASSWORD 'replace-me';"
sudo -u postgres psql -c "CREATE DATABASE sportpulse OWNER sportpulse;"
```

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Приложение слушает `0.0.0.0:3000`. В локальной сети откройте `http://<LAN-IP-компьютера>:3000`; если доступ блокирует система, разрешите входящие TCP-соединения на порту 3000 в firewall. API health check: `/api/health`.

Для production:

```bash
npm run build
npm start
```

## Docker Compose

Скопируйте `.env.example` в `.env`, задайте отдельные сильные значения `POSTGRES_PASSWORD`, `SESSION_SECRET` и `ADMIN_PASSWORD`, затем запустите:

Безопасные случайные значения можно получить командами `openssl rand -hex 24` для пароля БД и `openssl rand -hex 32` для `SESSION_SECRET`. Hex-значения безопасны для включения в `DATABASE_URL`; если пароль содержит `@`, `:` или `/`, URL-кодируйте пароль в URL подключения.

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f app
```

Веб-приложение публикуется на `0.0.0.0:${SPORTPULSE_PORT:-3000}` и доступно из LAN при разрешённом firewall. PostgreSQL не имеет опубликованного host-порта и доступен только во внутренней Docker-сети. Данные базы хранятся в volume `sportpulse-postgres`.

Session и избранное используют HTTP-only cookies. Флаг `Secure` включается для HTTPS-запросов (в том числе за TLS reverse proxy с `X-Forwarded-Proto: https`), поэтому локальный HTTP-доступ по LAN также сохраняет сессию.

Резервная копия и восстановление через внутреннее подключение PostgreSQL (команды используют значения по умолчанию из Compose):

```bash
docker compose exec -T db pg_dump -U sportpulse sportpulse > sportpulse-backup.sql
cat sportpulse-backup.sql | docker compose exec -T db psql -U sportpulse sportpulse
```

## Демо-вход редактора

Откройте `/admin/login`:

- Email: `admin@sportpulse.local`
- Пароль по умолчанию: `PulseAdmin2026!`

Seed создаёт администратора из `ADMIN_EMAIL` и `ADMIN_PASSWORD`. Переопределите эти значения перед развёртыванием. Демо-пароль предназначен только для локальной разработки.

Редакционная панель управляет статьями, командами, турнирами, матчами, игроками и видео. Изменяющие API операции проверяют подписанную HTTP-only сессию на сервере.

## Возможности

- Главная редакционная лента, избранные матчи, актуальная таблица Premier League и Video Center.
- `/scores`: матчи сгруппированы по турнирам; фильтры по дате, лиге и статусу.
- `/matches/[slug]`: счёт, статус, события, статистика, составы и связанное видео.
- `/leagues` и `/leagues/[slug]`: Premier League, La Liga, Serie A, Bundesliga, Ligue 1 и Champions League; таблицы, расписание, результаты и бомбардиры.
- `/teams` и `/teams/[slug]`: клубные профили, составы, статистика и матчи.
- `/players/[slug]`: профиль и статистика игрока.
- `/news`, `/news/[slug]`, `/videos`, `/search`, `/favorites`.
- Избранное команд, лиг, новостей и видео сохраняется в PostgreSQL по анонимной cookie браузера.

## API

Все ответы возвращаются в JSON. Основные публичные endpoint:

| Метод | Endpoint | Назначение |
| --- | --- | --- |
| GET | `/api/matches?date=YYYY-MM-DD&league=premier-league&status=LIVE` | Матчи выбранного дня и фильтры |
| GET | `/api/teams`, `/api/leagues`, `/api/players`, `/api/articles`, `/api/videos` | Каталоги сущностей |
| GET | `/api/{resource}/{id-or-slug}` | Страница сущности и связанные данные |
| GET | `/api/search?q=arsenal` | Поиск по клубам, лигам, игрокам, новостям, видео и матчам |
| GET/POST/DELETE | `/api/favorites` | Просмотр, сохранение и удаление избранного |
| GET/POST/DELETE | `/api/session` | Проверка сессии, вход и выход редактора |
| GET | `/api/health` | Проверка приложения и соединения с PostgreSQL |

`POST /api/{teams,leagues,matches,players,articles,videos}` создаёт запись, `PATCH` и `DELETE /api/{resource}/{id}` изменяют или удаляют её. Все операции записи требуют роли редактора или администратора. Payload валидируется Zod; ошибки возвращают понятное сообщение и HTTP status.

## Архитектура и данные

- `app/`: маршруты Next.js, страницы и REST handlers.
- `components/`: переиспользуемые блоки публичного сайта и админки.
- `lib/`: Prisma client, проверка сессии и валидация входных данных.
- `prisma/schema.prisma`: PostgreSQL схема; `prisma/migrations/`: версии схемы.
- `prisma/seed.ts`: повторяемое заполнение демонстрационными данными.
- `lib/football-provider.ts`: адаптер `FootballDataProvider`; сейчас используется database-backed mock provider.

Модели включают User, Team, League, Standing, Match, MatchEvent, Player, Category, Article, Video и Favorite. Для реального поставщика результатов следует добавить отдельный provider adapter, который сопоставляет внешние идентификаторы и статусы с этой доменной схемой.

## Проверки

```bash
npm run typecheck
npm test
npm run smoke
npm run build
```

`npm run smoke` проверяет HTTP-страницы, PostgreSQL health endpoint, поиск, демо-вход, доступ к админке, CRUD публикации и сохранение избранного. Перед его запуском должен работать сервер, например `npm run dev`. Не коммитьте `.env` и производственные секреты.
