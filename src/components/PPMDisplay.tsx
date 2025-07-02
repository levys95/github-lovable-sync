
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { PPMTotals, formatPPMValue } from '@/utils/ppmCalculations';

interface PPMDisplayProps {
  ppmTotals: PPMTotals;
}

export const PPMDisplay = ({ ppmTotals }: PPMDisplayProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Metal Content</CardTitle>
        <Zap className="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs bg-gray-100 w-full justify-between">
              <span>Ag:</span>
              <span className="font-semibold">{formatPPMValue(ppmTotals.Ag)}</span>
            </Badge>
            <Badge variant="outline" className="text-xs bg-yellow-100 w-full justify-between">
              <span>Au:</span>
              <span className="font-semibold">{formatPPMValue(ppmTotals.Au)}</span>
            </Badge>
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs bg-blue-100 w-full justify-between">
              <span>Pd:</span>
              <span className="font-semibold">{formatPPMValue(ppmTotals.Pd)}</span>
            </Badge>
            <Badge variant="outline" className="text-xs bg-orange-100 w-full justify-between">
              <span>Cu:</span>
              <span className="font-semibold">{formatPPMValue(ppmTotals.Cu)}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
