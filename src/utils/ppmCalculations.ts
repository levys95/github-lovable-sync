
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
  let totalAg = 0;
  let totalAu = 0;
  let totalPd = 0;
  let totalCu = 0;
  
  items.forEach(item => {
    const metalContent = getMetalContent(item.category);
    if (metalContent) {
      // Calculate net weight (excluding tare weights)
      const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
      
      // Add to total net weight
      totalNetWeight += netWeight;
      
      // Calculate total metal content (PPM * kg = total metal amount)
      totalAg += (metalContent.Ag * netWeight) / 1000000; // Convert PPM to actual weight
      totalAu += (metalContent.Au * netWeight) / 1000000;
      totalPd += (metalContent.Pd * netWeight) / 1000000;
      totalCu += (metalContent.Cu * netWeight) / 100; // Convert percentage to actual weight
    }
  });
  
  // Calculate weighted average PPM
  const totals: PPMTotals = {
    Ag: totalNetWeight > 0 ? (totalAg * 1000000) / totalNetWeight : 0, // Convert back to PPM
    Au: totalNetWeight > 0 ? (totalAu * 1000000) / totalNetWeight : 0,
    Pd: totalNetWeight > 0 ? (totalPd * 1000000) / totalNetWeight : 0,
    Cu: totalNetWeight > 0 ? (totalCu * 100) / totalNetWeight : 0 // Convert back to percentage
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
