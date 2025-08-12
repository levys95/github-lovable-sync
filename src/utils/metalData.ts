
import { resolveCategoryKey, getCategoryLabel } from './category-i18n';

export interface MetalContent {
  Ag: number; // Silver
  Au: number; // Gold
  Pd: number; // Palladium
  Cu: number; // Copper
}


export const categoryMetalData: Record<string, MetalContent> = {
  'Smartphones': { Ag: 750, Au: 130, Pd: 11, Cu: 8 },
  'Gsm a touches': { Ag: 1300, Au: 300, Pd: 11, Cu: 8 },
  'China Phone': { Ag: 550, Au: 90, Pd: 11, Cu: 8 },
  '15 au': { Ag: 650, Au: 15, Pd: 12, Cu: 17 },
  '30 au': { Ag: 280, Au: 28, Pd: 2, Cu: 20 },
  '50 au': { Ag: 550, Au: 50, Pd: 10, Cu: 19 },
  '100 au': { Ag: 900, Au: 100, Pd: 20, Cu: 20 },
  '150 au': { Ag: 900, Au: 150, Pd: 25, Cu: 20 },
  '200 au': { Ag: 950, Au: 200, Pd: 25, Cu: 20 },
  '250 au': { Ag: 950, Au: 250, Pd: 25, Cu: 20 },
  '300 au': { Ag: 950, Au: 300, Pd: 25, Cu: 20 },
  '350 au': { Ag: 950, Au: 350, Pd: 25, Cu: 20 },
  '400 au': { Ag: 950, Au: 400, Pd: 25, Cu: 20 },
  '800 au': { Ag: 1000, Au: 800, Pd: 30, Cu: 22 },
  '1000 +': { Ag: 1000, Au: 1000, Pd: 30, Cu: 22 }
};

export const getMetalContent = (category: string): MetalContent | null => {
  // Try direct match first (DB label may already be FR key)
  if (categoryMetalData[category]) return categoryMetalData[category];

  // Resolve from localized label to canonical key, then back to FR label used in data map
  const key = resolveCategoryKey(category);
  if (key) {
    const frLabel = getCategoryLabel(key, 'fr');
    if (categoryMetalData[frLabel]) return categoryMetalData[frLabel];
  }

  return null;
};
