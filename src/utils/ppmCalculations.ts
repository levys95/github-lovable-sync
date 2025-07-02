
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
  const totals: PPMTotals = { Ag: 0, Au: 0, Pd: 0, Cu: 0 };
  
  items.forEach(item => {
    const metalContent = getMetalContent(item.category);
    if (metalContent) {
      // Calculate net weight (excluding tare weights)
      const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
      
      // Calculate metal content in grams
      // PPM values are per kg, so multiply by net weight and divide by 1000 to get grams
      totals.Ag += (metalContent.Ag * netWeight) / 1000;
      totals.Au += (metalContent.Au * netWeight) / 1000;
      totals.Pd += (metalContent.Pd * netWeight) / 1000;
      totals.Cu += (metalContent.Cu * netWeight) / 1000;
    }
  });
  
  return totals;
};

export const formatPPMValue = (value: number, totalWeight: number, metalType: 'Ag' | 'Au' | 'Pd' | 'Cu'): string => {
  if (metalType === 'Cu') {
    // For Copper, show as percentage
    const percentage = (value * 1000) / totalWeight / 10; // Convert grams to percentage
    return `${percentage.toFixed(2)}%`;
  } else {
    // For Ag, Au, Pd show as PPM
    const ppm = (value * 1000) / totalWeight; // Convert grams to PPM (mg/kg)
    return `${ppm.toFixed(0)} ppm`;
  }
};
