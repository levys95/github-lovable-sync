import { Edit, Trash2, MapPin, Calendar } from 'lucide-react';
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
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Quantity:</span>
            <span className="font-semibold text-lg">{item.quantity}</span>
          </div>
          
          {item.brand && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Brand:</span>
              <span className="font-medium">{item.brand}</span>
            </div>
          )}
          
          {item.model && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Model:</span>
              <span className="font-medium">{item.model}</span>
            </div>
          )}
          
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
