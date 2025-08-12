
export const RAM_GENERATIONS = ['DDR5', 'DDR4', 'DDR3', 'DDR3L'] as const;
export type RamGeneration = typeof RAM_GENERATIONS[number];

export const MANUFACTURERS = ['SAMSUNG', 'HYNIX', 'MICRON', 'KINGSTON'] as const;
export type RamManufacturer = typeof MANUFACTURERS[number];

// Fréquences typiques par génération (liste non exhaustive)
export const FREQUENCIES_BY_GEN: Record<RamGeneration, number[]> = {
  DDR5: [4000, 4400, 4800, 5200, 5600, 6000, 6400],
  DDR4: [2133, 2400, 2666, 2933, 3000, 3200, 3600, 4000, 4266],
  DDR3: [1066, 1333, 1600, 1866, 2133],
  DDR3L: [1066, 1333, 1600, 1866],
};

export const CAPACITIES_GB = [1, 2, 4, 8, 16, 32, 64];
