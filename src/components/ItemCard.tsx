
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Package, MapPin, Calendar, Weight, User, Hash } from 'lucide-react';
import { MetalContentDisplay } from './MetalContent';

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

export const ItemCard = ({ item, onEdit, onDelete }: ItemCardProps) => {
  const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
  
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'waiting-sorting': return 'bg-yellow-100 text-yellow-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'ready': return 'Prêt';
      case 'waiting-sorting': return 'En Attente de Tri';
      case 'unknown': return 'Inconnu';
      default: return condition;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.category}</h3>
            {item.description && (
              <p className="text-xs text-gray-500 mb-2">{item.description}</p>
            )}
          </div>
          <Badge className={`text-xs ${getConditionColor(item.condition)}`}>
            {getConditionText(item.condition)}
          </Badge>
        </div>

        {/* Display first image if available */}
        {item.images && item.images.length > 0 && (
          <div className="mb-3">
            <img
              src={item.images[0]}
              alt={`Photo ${item.category}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
          </div>
        )}

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Weight className="h-4 w-4 mr-2" />
            <span>Total: {item.quantity}kg</span>
            {(item.bigBagWeight || item.palletWeight) && (
              <span className="ml-2 text-xs text-gray-500">
                (Net: {netWeight.toFixed(1)}kg)
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{item.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(item.dateAdded).toLocaleDateString('fr-FR')}</span>
          </div>

          {item.brand && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{item.brand}</span>
              {item.model && <span className="ml-1">- {item.model}</span>}
            </div>
          )}

          {item.shipmentNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <Hash className="h-4 w-4 mr-2" />
              <span>{item.shipmentNumber}</span>
            </div>
          )}
        </div>

        {/* Metal Content Display */}
        <div className="mb-3">
          <MetalContentDisplay category={item.category} className="mb-2" />
        </div>

        <div className="flex justify-end space-x-2">
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
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer cet élément "{item.category}" ? Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
