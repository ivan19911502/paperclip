import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = (process.env.SPORTPULSE_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`).replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL ?? 'admin@sportpulse.local';
const password = process.env.ADMIN_PASSWORD ?? 'PulseAdmin2026!';

async function request(path, options = {}) {
  return fetch(`${base}${path}`, { ...options, headers: { ...(options.headers ?? {}) } });
}

for (const path of ['/', '/scores', '/leagues', '/leagues/premier-league', '/leagues/champions-league', '/teams', '/teams/premier-league-ars', '/players/premier-league-ars-player-1', '/news', '/news/arsenal-title-race', '/videos', '/search', '/favorites', '/admin/login']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} should return 200, got ${response.status}`);
  await response.arrayBuffer();
  console.log(`PASS page ${path}`);
}

const health = await request('/api/health');
assert.equal(health.status, 200);
assert.equal((await health.json()).database, 'connected');
console.log('PASS PostgreSQL health check');

for (const collection of ['teams', 'leagues', 'players', 'articles', 'videos']) {
  const response = await request(`/api/${collection}?limit=2`);
  assert.equal(response.status, 200, `/api/${collection} should return 200`);
  assert.ok((await response.json()).data.length > 0, `/api/${collection} should contain seeded records`);
}
console.log('PASS seeded entity collection endpoints');

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk' }).format(new Date());
const day = (offset) => {
  const value = new Date(`${today}T12:00:00`);
  value.setDate(value.getDate() + offset);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk' }).format(value);
};
let todayFixtures = [];
for (const offset of [-1, 0, 1]) {
  const response = await request(`/api/matches?date=${day(offset)}`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.provider, 'demo');
  assert.ok(result.total > 0, `expected demo fixtures on ${day(offset)}`);
  if (offset === 0) todayFixtures = result.data;
}
console.log('PASS match provider, date filters, and today/yesterday/tomorrow data');
const matchPage = await request(`/matches/${todayFixtures[0].slug}`);
assert.equal(matchPage.status, 200, 'match detail should render for a seeded fixture');
console.log('PASS dynamic match detail page');

const search = await request('/api/search?q=арсенал');
assert.equal(search.status, 200);
assert.ok((await search.json()).data.some((item) => item.href.includes('/teams/')));
console.log('PASS global search');

const unauthorized = await request('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
assert.equal(unauthorized.status, 401);
console.log('PASS admin API rejects anonymous writes');

const login = await request('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
assert.equal(login.status, 200, 'demo admin credentials should authenticate');
const sessionSetCookie = login.headers.get('set-cookie') ?? '';
assert.equal(/;\s*Secure/i.test(sessionSetCookie), base.startsWith('https:'), 'session cookie Secure flag should follow the request protocol');
const sessionCookie = sessionSetCookie.split(';')[0];
assert.ok(sessionCookie, 'login should set an HTTP-only session cookie');
assert.equal((await request('/api/session', { headers: { Cookie: sessionCookie } })).status, 200);
assert.equal((await request('/admin', { headers: { Cookie: sessionCookie } })).status, 200);
console.log('PASS demo editor authentication and protected admin page');

const categories = await (await request('/api/categories')).json();
const testSlug = `smoke-${randomUUID().slice(0, 8)}`;
const articlePayload = { slug: testSlug, title: `HTTP smoke test ${testSlug}`, excerpt: 'A test article created and removed by the SportPulse HTTP smoke test.', body: 'This temporary article exists only to exercise the authenticated content management API and will be deleted before the smoke check ends.', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=70', author: 'Smoke test', readMinutes: 1, featured: false, published: false, categoryId: categories.data[0].id };
const created = await request('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: sessionCookie }, body: JSON.stringify(articlePayload) });
assert.equal(created.status, 201, `article create failed: ${await created.clone().text()}`);
const createdArticle = (await created.json()).data;
const updated = await request(`/api/articles/${createdArticle.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: sessionCookie }, body: JSON.stringify({ excerpt: 'Updated by the authenticated HTTP smoke test.' }) });
assert.equal(updated.status, 200);
assert.equal((await updated.json()).data.excerpt, 'Updated by the authenticated HTTP smoke test.');
const deleted = await request(`/api/articles/${createdArticle.id}`, { method: 'DELETE', headers: { Cookie: sessionCookie } });
assert.equal(deleted.status, 200);
console.log('PASS authenticated article create, update, and delete');

const teams = await (await request('/api/teams?limit=1')).json();
const teamId = teams.data[0].id;
const saved = await request('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'TEAM', targetId: teamId }) });
assert.equal(saved.status, 201);
const visitorSetCookie = saved.headers.get('set-cookie') ?? '';
assert.equal(/;\s*Secure/i.test(visitorSetCookie), base.startsWith('https:'), 'favorite cookie Secure flag should follow the request protocol');
const visitorCookie = visitorSetCookie.split(';')[0];
assert.ok(visitorCookie);
const favorites = await request('/api/favorites', { headers: { Cookie: visitorCookie } });
assert.ok((await favorites.json()).data.some((item) => item.targetId === teamId));
const removed = await request('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Cookie: visitorCookie }, body: JSON.stringify({ type: 'TEAM', targetId: teamId }) });
assert.equal(removed.status, 200);
console.log('PASS anonymous favorites persistence and removal');

await request('/api/session', { method: 'DELETE', headers: { Cookie: sessionCookie } });
console.log('SportPulse HTTP smoke check passed.');
