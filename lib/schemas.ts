import { z } from 'zod';

const slug = z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const url = z.string().url();
const optionalText = z.string().max(500).optional().nullable();

export const resourceSchemas = {
  teams: z.object({ slug, name: z.string().min(2).max(100), shortName: z.string().min(2).max(8), mark: z.string().min(1).max(8), primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), country: z.string().min(2), leagueId: optionalText }),
  leagues: z.object({ slug, name: z.string().min(2).max(100), country: z.string().min(2), countryCode: z.string().min(2).max(8), season: z.string().min(4).max(20), logo: z.string().min(1).max(8), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
  matches: z.object({ slug, leagueId: z.string().min(1), homeTeamId: z.string().min(1), awayTeamId: z.string().min(1), kickoff: z.string().datetime(), status: z.enum(['SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED']), homeScore: z.number().int().min(0).nullable().optional(), awayScore: z.number().int().min(0).nullable().optional(), minute: z.number().int().min(0).max(130).nullable().optional(), round: optionalText, venue: optionalText }),
  players: z.object({ slug, name: z.string().min(2).max(100), number: z.number().int().min(1).max(99), position: z.enum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']), age: z.number().int().min(15).max(55), nationality: z.string().min(2), image: url, appearances: z.number().int().min(0).default(0), goals: z.number().int().min(0).default(0), assists: z.number().int().min(0).default(0), yellowCards: z.number().int().min(0).default(0), redCards: z.number().int().min(0).default(0), teamId: z.string().min(1) }),
  articles: z.object({ slug, title: z.string().min(8).max(180), excerpt: z.string().min(15).max(300), body: z.string().min(40), image: url, author: z.string().min(2).max(80), readMinutes: z.number().int().min(1).max(60).default(4), featured: z.boolean().default(false), published: z.boolean().default(true), publishedAt: z.string().datetime().optional(), categoryId: z.string().min(1) }),
  videos: z.object({ slug, title: z.string().min(5).max(180), description: z.string().min(10).max(300), thumbnail: url, duration: z.string().regex(/^\d{1,2}:\d{2}$/), category: z.string().min(2).max(50), videoUrl: z.string().url(), publishedAt: z.string().datetime().optional() }),
} as const;

export type ResourceName = keyof typeof resourceSchemas;

export const prismaDelegateNames: Record<ResourceName, string> = {
  teams: 'team',
  leagues: 'league',
  matches: 'match',
  players: 'player',
  articles: 'article',
  videos: 'video',
};

export function isResourceName(value: string): value is ResourceName {
  return Object.hasOwn(resourceSchemas, value);
}

export function parseResource(resource: ResourceName, input: unknown, partial = false) {
  const schema = resourceSchemas[resource];
  return (partial ? schema.partial() : schema).parse(input);
}

export function slugify(value: string) {
  const transliteration: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  return [...value.normalize('NFKD').toLowerCase()].map((character) => transliteration[character] ?? character).join('').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
