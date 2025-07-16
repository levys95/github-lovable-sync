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
  dateAdded: string;
  description?: string;
  brand?: string;
  model?: string;
  bigBagWeight?: number;
  palletWeight?: number;
  images?: string[];
  shipmentNumber?: string;
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

export const ItemCard = ({ item, onEdit, onDelete }: ItemCardProps) => {
  const { t } = useLanguage();
  
  const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
  const conditionColor = getConditionColor(item.condition);
  const conditionIcon = getConditionIcon(item.condition);
  const conditionText = getConditionText(item.condition);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="mb-4">
          <div className="text-lg font-semibold">{item.name}</div>
          <div className="text-sm text-gray-500">
            <MapPin className="inline-block h-4 w-4 mr-1 align-middle" />
            {item.location}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <div className="text-xs font-medium text-gray-600">Quantité:</div>
            <div className="text-sm">{item.quantity} kg</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600">Date d'Ajout:</div>
            <div className="text-sm">
              <Calendar className="inline-block h-4 w-4 mr-1 align-middle" />
              {item.dateAdded}
            </div>
          </div>
        </div>

        {/* Shipment Number */}
        {item.shipmentNumber && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600">Numéro d'Expédition:</div>
            <div className="text-sm">
              <Hash className="inline-block h-4 w-4 mr-1 align-middle" />
              {item.shipmentNumber}
            </div>
          </div>
        )}

        {/* Condition Badge */}
        <Badge className={`mb-4 ${conditionColor}`}>
          {conditionIcon}
          {conditionText}
        </Badge>

        {/* Net Weight Display */}
        {(item.bigBagWeight || item.palletWeight) && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600">Poids Net:</div>
            <div className="text-sm font-semibold">{netWeight.toFixed(2)} kg</div>
          </div>
        )}

        {/* Metal Content Display */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600">Contenu Métallique:</div>
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
