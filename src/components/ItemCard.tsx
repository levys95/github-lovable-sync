import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Package, MapPin, Calendar, Weight, User, Hash } from 'lucide-react';
import { MetalContentDisplay } from './MetalContent';
import { useLanguage } from '@/contexts/LanguageContext';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  condition: 'ready' | 'waiting-sorting' | 'unknown';
  quantity: number;
  location: string;
  date_added: string;
  description?: string;
  brand?: string;
  big_bag_weight?: number;
  pallet_weight?: number;
  images?: string[];
  shipment_number?: string;
}

interface ItemCardProps {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

const getConditionColor = (condition: InventoryItem['condition']): string => {
  switch (condition) {
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'waiting-sorting':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getConditionIcon = (condition: InventoryItem['condition']) => {
  switch (condition) {
    case 'ready':
      return <Package className="h-4 w-4 mr-1" />;
    case 'waiting-sorting':
      return <Weight className="h-4 w-4 mr-1" />;
    default:
      return <User className="h-4 w-4 mr-1" />;
  }
};

const getConditionText = (condition: InventoryItem['condition']): string => {
  switch (condition) {
    case 'ready':
      return 'Prêt';
    case 'waiting-sorting':
      return 'En Attente';
    default:
      return 'Inconnu';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
};

export const ItemCard = ({ item, onEdit, onDelete }: ItemCardProps) => {
  const { t } = useLanguage();
  
  // Calculate net weight
  const netWeight = item.quantity - (item.big_bag_weight || 0) - (item.pallet_weight || 0);
  
  const conditionColor = getConditionColor(item.condition);
  const conditionIcon = getConditionIcon(item.condition);
  const conditionText = getConditionText(item.condition);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">
            <MapPin className="inline-block h-4 w-4 mr-1 align-middle" />
            {item.location}
          </div>
        </div>

        {/* Category and Brands Section */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
            
            {item.brand && (
              <Badge variant="outline" className="text-xs">
                {item.brand}
              </Badge>
            )}
            
            {item.shipment_number && (
              <Badge variant="outline">{item.shipment_number}</Badge>
            )}
          </div>
          
          {/* Condition Badge */}
          <Badge className={`${conditionColor}`}>
            {conditionIcon}
            {conditionText}
          </Badge>
        </div>

        {/* Images Gallery */}
        {item.images && item.images.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 mb-2">Nuotraukos:</div>
            <div className="grid grid-cols-2 gap-2">
              {item.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`${item.name} nuotrauka ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            {item.images.length > 4 && (
              <div className="text-xs text-gray-500 mt-1">
                +{item.images.length - 4} daugiau nuotraukų
              </div>
            )}
          </div>
        )}

        {/* Weight Information */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Poids Total:</span>
              <span className="text-lg font-bold text-gray-900">{item.quantity.toFixed(2)} kg</span>
            </div>
            
            {/* Show breakdown if bag or pallet weights exist */}
            <div className="text-xs text-gray-600 space-y-1">
              {item.big_bag_weight && item.big_bag_weight > 0 && (
                <div className="text-xs text-gray-500">Big Bag: {item.big_bag_weight}kg</div>
              )}
              {item.pallet_weight && item.pallet_weight > 0 && (
                <div className="text-xs text-gray-500">Palette: {item.pallet_weight}kg</div>
              )}
              {(item.big_bag_weight || item.pallet_weight) && (
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="font-medium">Poids Net:</span>
                  <span className="font-bold text-green-600">{netWeight.toFixed(2)} kg</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date and Additional Info */}
        <div className="mb-4 text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <div className="text-xs text-gray-500">
              {formatDate(item.date_added)}
            </div>
          </div>
        </div>

        {/* Metal Content Display */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-1">Contenu Métallique:</div>
          <MetalContentDisplay category={item.category} />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirm.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('confirm.description').replace('{category}', item.category)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('confirm.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  {t('confirm.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};