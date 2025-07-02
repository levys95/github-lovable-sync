
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { PPMTotals, formatPPMValue } from '@/utils/ppmCalculations';

interface PPMDisplayProps {
  ppmTotals: PPMTotals;
  totalWeight: number;
  totalGrossWeight: number;
}

export const PPMDisplay = ({ ppmTotals, totalWeight, totalGrossWeight }: PPMDisplayProps) => {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2">
      <CardHeader className="text-center pb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-bold text-gray-800">Contenu Métallique Total</CardTitle>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalGrossWeight.toFixed(1)} KG</div>
          <p className="text-sm text-gray-500 font-medium">Poids Total</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center border">
            <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(ppmTotals.Ag)}</div>
            <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
            <div className="text-xs text-gray-500">ppm</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(ppmTotals.Pd)}</div>
            <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
            <div className="text-xs text-blue-500">ppm</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(ppmTotals.Au)}</div>
            <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
            <div className="text-xs text-yellow-500">ppm</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
            <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(ppmTotals.Cu)}%</div>
            <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
            <div className="text-xs text-orange-500">pourcent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
