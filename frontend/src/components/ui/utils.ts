import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Airline brand detection for flight hover logos
// Looks for substrings: THY/Thy, Ajet/AJET/ajet, PEGASUS/PG/pegeasus/Pg
export type AirlineBrand = 'thy' | 'ajet' | 'pegasus' | null;

export function detectAirlineBrand(text?: string | null): AirlineBrand {
  if (!text) return null;
  const s = text.toLowerCase();
  if (s.includes('thy')) return 'thy';
  if (s.includes('ajet')) return 'ajet';
  if (s.includes('pegasus') || s.includes('pegasus') || s.includes('pg')) return 'pegasus';
  return null;
}

export function airlineBrandLogoSrc(brand: AirlineBrand): string | null {
  switch (brand) {
    case 'thy':
      return '/assets/thy.png';
    case 'ajet':
      return '/assets/ajet.png';
    case 'pegasus':
      return '/assets/pegasus.png';
    default:
      return null;
  }
}

// City image detection for structured plan items with TR/EN synonyms
// Asset naming remains canonical per prior guidance
// Map: alias (detected string) => asset slug (without extension)
const CITY_ALIAS_TO_ASSET: Array<[string, string]> = [
  ['istanbul', 'istanbul'],
  ['trabzon', 'trabzon'],
  ['izmir', 'izmir'],
  ['paris', 'paris'],
  ['new york', 'new-york'],
  ['newyork', 'new-york'],
  ['berlin', 'berlin'],
  ['nice', 'nice'],
  ['bangkok', 'bangkok'],
  ['ankara', 'ankara'],
  ['konya', 'konya'],
  ['antalya', 'antalya'],
  ['bodrum', 'bodrum'],
  ['muğla', 'mugla'],
  ['mugla', 'mugla'],
  ['erzurum', 'erzurum'],
  ['londra', 'londra'],
  ['london', 'londra'],
];

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
}

export function detectCityImageFromTexts(title?: string | null, content?: string | null): string | null {
  const t = (title || '').toLowerCase();
  const c = (content || '').toLowerCase();
  const hay = `${t} ${c}`.trim();
  const hayAscii = stripDiacritics(hay);

  for (const [alias, assetSlug] of CITY_ALIAS_TO_ASSET) {
    const aliasLower = alias.toLowerCase();
    const aliasAscii = stripDiacritics(aliasLower);
    if (hay.includes(aliasLower) || hayAscii.includes(aliasAscii)) {
      return `/assets/${assetSlug}.jpg`;
    }
  }

  // Fallback: fuzzy matching for minor typos (e.g., "LONDRON" -> "london")
  const tokens = hayAscii
    .split(/[^a-z]+/i)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3);

  for (const [alias, assetSlug] of CITY_ALIAS_TO_ASSET) {
    const aliasAscii = stripDiacritics(alias.toLowerCase());
    const allowedDistance = aliasAscii.length <= 4 ? 0 : aliasAscii.length <= 6 ? 1 : 2;
    for (const token of tokens) {
      if (token === aliasAscii) {
        return `/assets/${assetSlug}.jpg`;
      }
      const dist = levenshteinDistance(token, aliasAscii);
      if (dist <= allowedDistance) {
        return `/assets/${assetSlug}.jpg`;
      }
    }
  }
  return null;
}

// Levenshtein distance for fuzzy city matching
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      }
      prev = temp;
    }
  }
  return dp[n];
}
