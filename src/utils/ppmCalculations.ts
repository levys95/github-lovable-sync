
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
      
      // Calculate PPM contribution from this item
      // PPM values are per kg, so multiply by net weight in kg
      totals.Ag += (metalContent.Ag * netWeight) / 1000; // Convert ppm to grams
      totals.Au += (metalContent.Au * netWeight) / 1000;
      totals.Pd += (metalContent.Pd * netWeight) / 1000;
      totals.Cu += (metalContent.Cu * netWeight) / 1000;
    }
  });
  
  return totals;
};

export const formatPPMValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}kg`;
  } else if (value >= 1) {
    return `${value.toFixed(1)}g`;
  } else {
    return `${(value * 1000).toFixed(0)}mg`;
  }
};
