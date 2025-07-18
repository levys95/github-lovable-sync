import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetalContentDisplay } from './MetalContent';
import { ImageCapture } from './ImageCapture';
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
  model?: string;
  big_bag_weight?: number;
  pallet_weight?: number;
  images?: string[];
  shipment_number?: string;
}

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: InventoryItem | null;
  categories: string[];
}

const locationZones = [
  'A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6', 'A-7', 'A-8', 'A-9',
  'B-1', 'B-2', 'B-3', 'B-4', 'B-5', 'B-6'
];

export const ItemDialog = ({ isOpen, onClose, onSave, item, categories }: ItemDialogProps) => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    category: '',
    condition: 'ready' as 'ready' | 'waiting-sorting' | 'unknown',
    quantity: 1,
    location: '',
    date_added: new Date().toISOString().split('T')[0],
    description: '',
    big_bag_weight: 0,
    pallet_weight: 0,
    images: [] as string[],
    shipment_number: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category,
        condition: item.condition,
        quantity: item.quantity,
        location: item.location,
        date_added: item.date_added,
        description: item.description || '',
        big_bag_weight: item.big_bag_weight || 0,
        pallet_weight: item.pallet_weight || 0,
        images: item.images || [],
        shipment_number: item.shipment_number || ''
      });
    } else if (isOpen) {
      // Reset form when opening for new item
      setFormData({
        category: '',
        condition: 'ready',
        quantity: 1,
        location: '',
        date_added: new Date().toISOString().split('T')[0],
        description: '',
        big_bag_weight: 0,
        pallet_weight: 0,
        images: [],
        shipment_number: ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      onSave({ ...item, ...formData });
    } else {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const netWeight = formData.quantity - formData.big_bag_weight - formData.pallet_weight;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? t('dialog.edit') : t('dialog.add')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">{t('dialog.category')}</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dialog.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.category && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600">{t('dialog.metalContent')}</Label>
                    <MetalContentDisplay category={formData.category} className="mt-1" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">{t('dialog.condition')}</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">{t('dialog.ready')}</SelectItem>
                      <SelectItem value="waiting-sorting">{t('dialog.waitingSorting')}</SelectItem>
                      <SelectItem value="unknown">{t('dialog.unknown')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_added">{t('dialog.dateAdded')}</Label>
                  <Input
                    id="date_added"
                    type="date"
                    value={formData.date_added}
                    onChange={(e) => handleInputChange('date_added', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipment_number">{t('dialog.shipmentNumber')}</Label>
                <Input
                  id="shipment_number"
                  value={formData.shipment_number}
                  onChange={(e) => handleInputChange('shipment_number', e.target.value)}
                  placeholder="ex: EXP-2024-001"
                />
              </div>

              {/* Weight Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium text-gray-900">{t('dialog.weightInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">{t('dialog.totalWeight')}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="big_bag_weight">{t('dialog.bigBagWeight')}</Label>
                    <Input
                      id="big_bag_weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.big_bag_weight}
                      onChange={(e) => handleInputChange('big_bag_weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pallet_weight">{t('dialog.palletWeight')}</Label>
                    <Input
                      id="pallet_weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pallet_weight}
                      onChange={(e) => handleInputChange('pallet_weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                {(formData.big_bag_weight > 0 || formData.pallet_weight > 0) && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{t('dialog.netWeight')}</span>
                      <span className="text-lg font-bold text-green-600">{netWeight.toFixed(2)} kg</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('dialog.location')}</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dialog.selectLocation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {locationZones.map(zone => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('dialog.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('dialog.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-4">
              <ImageCapture
                images={formData.images}
                onImagesChange={(images) => handleInputChange('images', images)}
                maxImages={10}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('dialog.cancel')}
            </Button>
            <Button type="submit">
              {item ? t('dialog.update') : t('dialog.addItem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
