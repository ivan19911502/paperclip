import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterMatchesForFavorites } from '../lib/match-filters';

const matches = [
  { id: 'match-1', league: { id: 'league-1' }, homeTeam: { id: 'team-1' }, awayTeam: { id: 'team-2' } },
  { id: 'match-2', league: { id: 'league-2' }, homeTeam: { id: 'team-3' }, awayTeam: { id: 'team-4' } },
  { id: 'match-3', league: { id: 'league-1' }, homeTeam: { id: 'team-5' }, awayTeam: { id: 'team-6' } },
];

describe('Мои матчи', () => {
  it('включает матчи избранной команды независимо от её позиции', () => {
    assert.deepEqual(filterMatchesForFavorites(matches, [{ type: 'TEAM', targetId: 'team-4' }]).map(({ id }) => id), ['match-2']);
  });

  it('включает все матчи избранной лиги', () => {
    assert.deepEqual(filterMatchesForFavorites(matches, [{ type: 'LEAGUE', targetId: 'league-1' }]).map(({ id }) => id), ['match-1', 'match-3']);
  });

  it('объединяет совпадения по лиге и команде без дубликатов', () => {
    assert.deepEqual(filterMatchesForFavorites(matches, [
      { type: 'LEAGUE', targetId: 'league-1' },
      { type: 'TEAM', targetId: 'team-4' },
    ]).map(({ id }) => id), ['match-1', 'match-2', 'match-3']);
  });

  it('не включает матчи, если избранного нет или в нём только другие типы', () => {
    assert.deepEqual(filterMatchesForFavorites(matches, []), []);
    assert.deepEqual(filterMatchesForFavorites(matches, [{ type: 'ARTICLE', targetId: 'article-1' }]), []);
  });
});
