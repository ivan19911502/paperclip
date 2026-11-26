import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resourceSchemas, slugify } from '../lib/schemas';

describe('SportPulse input validation', () => {
  it('creates stable latin slugs from Russian names', () => {
    assert.equal(slugify('Пари Сен-Жермен'), 'pari-sen-zhermen');
    assert.equal(slugify('La Liga 2026/27'), 'la-liga-2026-27');
  });

  it('accepts a valid fixture with an explicit status and non-negative score', () => {
    assert.equal(resourceSchemas.matches.safeParse({ slug: 'arsenal-city', leagueId: 'league1', homeTeamId: 'team1', awayTeamId: 'team2', kickoff: '2026-11-26T18:00:00.000Z', status: 'LIVE', homeScore: 1, awayScore: 0, minute: 70 }).success, true);
  });

  it('rejects malformed slugs, invalid statuses, and negative scores', () => {
    const base = { slug: 'bad slug', leagueId: 'league1', homeTeamId: 'team1', awayTeamId: 'team2', kickoff: 'not-a-date', status: 'UNKNOWN', homeScore: -1, awayScore: 0 };
    assert.equal(resourceSchemas.matches.safeParse(base).success, false);
  });

  it('requires valid category relationships and complete article content', () => {
    const article = { slug: 'football-story', title: 'A complete football story', excerpt: 'A clear summary of the match and what it means.', body: 'A sufficiently long story body for the editor validation to accept this material.', image: 'https://images.example.com/cover.jpg', author: 'SportPulse', categoryId: 'category-1' };
    assert.equal(resourceSchemas.articles.safeParse(article).success, true);
    assert.equal(resourceSchemas.articles.safeParse({ ...article, image: 'not-an-url' }).success, false);
  });
});
