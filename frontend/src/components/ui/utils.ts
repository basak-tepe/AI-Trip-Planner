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
