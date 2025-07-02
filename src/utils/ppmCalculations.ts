
import { getMetalContent } from './metalData';

export interface PPMTotals {
  Ag: number; // Silver
  Au: number; // Gold
  Pd: number; // Palladium
  Cu: number; // Copper
}

export const calculateTotalPPM = (items: Array<{
  category: string;
  quantity: number;
  bigBagWeight?: number;
  palletWeight?: number;
}>): PPMTotals => {
  let totalNetWeight = 0;
  let weightedAg = 0;
  let weightedAu = 0;
  let weightedPd = 0;
  let weightedCu = 0;
  
  items.forEach(item => {
    const metalContent = getMetalContent(item.category);
    if (metalContent) {
      // Calculate net weight (excluding tare weights)
      const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
      
      // Add to total net weight
      totalNetWeight += netWeight;
      
      // Calculate weighted values (PPM * weight)
      weightedAg += metalContent.Ag * netWeight;
      weightedAu += metalContent.Au * netWeight;
      weightedPd += metalContent.Pd * netWeight;
      weightedCu += metalContent.Cu * netWeight;
    }
  });
  
  // Calculate weighted averages
  const totals: PPMTotals = {
    Ag: totalNetWeight > 0 ? weightedAg / totalNetWeight : 0,
    Au: totalNetWeight > 0 ? weightedAu / totalNetWeight : 0,
    Pd: totalNetWeight > 0 ? weightedPd / totalNetWeight : 0,
    Cu: totalNetWeight > 0 ? weightedCu / totalNetWeight : 0
  };
  
  return totals;
};

export const formatPPMValue = (value: number, totalWeight: number, metalType: 'Ag' | 'Au' | 'Pd' | 'Cu'): string => {
  if (metalType === 'Cu') {
    // For Copper, show as percentage
    return `${value.toFixed(0)}%`;
  } else {
    // For Ag, Au, Pd show as PPM
    return `${value.toFixed(0)} ppm`;
  }
};
