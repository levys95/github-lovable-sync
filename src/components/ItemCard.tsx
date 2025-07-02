
import { Edit, Trash2, MapPin, Calendar, Weight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetalContentDisplay } from './MetalContent';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  condition: 'working' | 'damaged' | 'for-parts';
  quantity: number;
  location: string;
  dateAdded: string;
  description?: string;
  brand?: string;
  model?: string;
  bigBagWeight?: number;
  palletWeight?: number;
}

interface ItemCardProps {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

export const ItemCard = ({ item, onEdit, onDelete }: ItemCardProps) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'working': return 'bg-green-100 text-green-800 border-green-200';
      case 'damaged': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'for-parts': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCondition = (condition: string) => {
    switch (condition) {
      case 'working': return 'Working';
      case 'damaged': return 'Damaged';
      case 'for-parts': return 'For Parts';
      default: return condition;
    }
  };

  const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
  const hasTareWeight = (item.bigBagWeight && item.bigBagWeight > 0) || (item.palletWeight && item.palletWeight > 0);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{item.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
              <Badge className={`text-xs ${getConditionColor(item.condition)}`}>
                {formatCondition(item.condition)}
              </Badge>
            </div>
            <MetalContentDisplay category={item.category} />
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Weight Information */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Weight Information</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Weight:</span>
              <span className="font-semibold">{item.quantity} kg</span>
            </div>
            
            {hasTareWeight && (
              <>
                {item.bigBagWeight && item.bigBagWeight > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Big Bag:</span>
                    <span className="text-sm">-{item.bigBagWeight} kg</span>
                  </div>
                )}
                
                {item.palletWeight && item.palletWeight > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pallet:</span>
                    <span className="text-sm">-{item.palletWeight} kg</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-green-700">Net Weight:</span>
                  <span className="font-bold text-green-700">{netWeight.toFixed(2)} kg</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{item.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Added: {new Date(item.dateAdded).toLocaleDateString()}</span>
          </div>
          
          {item.description && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
