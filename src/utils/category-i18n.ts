export type CategoryKey =
  | 'smartphones'
  | 'gsm_touches'
  | 'china_phone'
  | 'au_15'
  | 'au_30'
  | 'au_50'
  | 'au_100'
  | 'au_150'
  | 'au_200'
  | 'au_250'
  | 'au_300'
  | 'au_350'
  | 'au_400'
  | 'au_800'
  | 'au_1000_plus';

interface CategoryInfo {
  fr: string;
  lt: string;
  aliases?: string[]; // alternate labels to resolve user/DB variations
}

const categories: Record<CategoryKey, CategoryInfo> = {
  smartphones: {
    fr: 'Smartphones',
    lt: 'Išmanieji telefonai',
    aliases: ['smartphone', 'smart-phones']
  },
  gsm_touches: {
    fr: 'Gsm a touches',
    lt: 'Mygtukiniai telefonai',
    aliases: ['GSM à touches', 'GSM a touche', 'GSM classic']
  },
  china_phone: {
    fr: 'China Phone',
    lt: 'Kinų telefonai',
    aliases: ['telephone chinois', 'kinu telefonas']
  },
  au_15: { fr: '15 au', lt: '15 Au', aliases: ['15  au', '15au'] },
  au_30: { fr: '30 au', lt: '30 Au', aliases: ['30  au', '30au'] },
  au_50: { fr: '50 au', lt: '50 Au', aliases: ['50  au', '50au'] },
  au_100: { fr: '100 au', lt: '100 Au', aliases: ['100  au', '100au'] },
  au_150: { fr: '150 au', lt: '150 Au', aliases: ['150  au', '150au'] },
  au_200: { fr: '200 au', lt: '200 Au', aliases: ['200  au', '200au'] },
  au_250: { fr: '250 au', lt: '250 Au', aliases: ['250  au', '250au'] },
  au_300: { fr: '300 au', lt: '300 Au', aliases: ['300  au', '300au'] },
  au_350: { fr: '350 au', lt: '350 Au', aliases: ['350  au', '350au'] },
  au_400: { fr: '400 au', lt: '400 Au', aliases: ['400  au', '400au'] },
  au_800: { fr: '800 au', lt: '800 Au', aliases: ['800  au', '800au'] },
  au_1000_plus: { fr: '1000 +', lt: '1000 +', aliases: ['1000+', '1000  +'] },
};

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export const resolveCategoryKey = (input: string): CategoryKey | null => {
  const norm = normalize(input);
  // Direct match against fr/lt and aliases
  for (const [key, info] of Object.entries(categories) as [CategoryKey, CategoryInfo][]) {
    if (
      normalize(info.fr) === norm ||
      normalize(info.lt) === norm ||
      (info.aliases && info.aliases.some(a => normalize(a) === norm))
    ) {
      return key;
    }
  }
  // Try to match numeric Au categories like "15 au", "30 au", ... ignoring case
  const auMatch = norm.match(/^(\d+)\s*au\s*\+?$/);
  if (auMatch) {
    const num = auMatch[1];
    const map: Record<string, CategoryKey> = {
      '15': 'au_15',
      '30': 'au_30',
      '50': 'au_50',
      '100': 'au_100',
      '150': 'au_150',
      '200': 'au_200',
      '250': 'au_250',
      '300': 'au_300',
      '350': 'au_350',
      '400': 'au_400',
      '800': 'au_800',
    };
    if (map[num]) return map[num];
  }
  if (norm === '1000+' || norm === '1000 +' || norm === '1000 au +' || norm === '1000au+') {
    return 'au_1000_plus';
  }
  return null;
};

export const getCategoryLabel = (keyOrInput: CategoryKey | string, lang: 'fr' | 'lt'): string => {
  const key = (Object.keys(categories) as CategoryKey[]).includes(keyOrInput as CategoryKey)
    ? (keyOrInput as CategoryKey)
    : resolveCategoryKey(String(keyOrInput)) || null;
  if (!key) return String(keyOrInput);
  return categories[key][lang];
};

export const translateCategoryLabel = (labelFromDB: string, lang: 'fr' | 'lt'): string => {
  const key = resolveCategoryKey(labelFromDB);
  if (!key) return labelFromDB; // fallback to original
  return getCategoryLabel(key, lang);
};
