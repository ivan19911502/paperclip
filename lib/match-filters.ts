export type FollowedEntity = { type: string; targetId: string };
export type MatchReferences = { league: { id: string }; homeTeam: { id: string }; awayTeam: { id: string } };

export function filterMatchesForFavorites<T extends MatchReferences>(matches: T[], favorites: FollowedEntity[]) {
  const leagueIds = new Set(favorites.filter((favorite) => favorite.type === 'LEAGUE').map((favorite) => favorite.targetId));
  const teamIds = new Set(favorites.filter((favorite) => favorite.type === 'TEAM').map((favorite) => favorite.targetId));
  if (leagueIds.size === 0 && teamIds.size === 0) return [];
  return matches.filter((match) => leagueIds.has(match.league.id) || teamIds.has(match.homeTeam.id) || teamIds.has(match.awayTeam.id));
}
