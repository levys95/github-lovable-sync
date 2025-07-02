
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  item?: InventoryItem | null;
  categories: string[];
}

export const ItemDialog = ({ isOpen, onClose, onSave, item, categories }: ItemDialogProps) => {
  const [formData, setFormData] = useState({
    category: '',
    condition: 'working' as 'working' | 'damaged' | 'for-parts',
    quantity: 1,
    location: '',
    dateAdded: new Date().toISOString().split('T')[0],
    description: '',
    bigBagWeight: 0,
    palletWeight: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category,
        condition: item.condition,
        quantity: item.quantity,
        location: item.location,
        dateAdded: item.dateAdded,
        description: item.description || '',
        bigBagWeight: item.bigBagWeight || 0,
        palletWeight: item.palletWeight || 0
      });
    } else if (isOpen) {
      // Reset form when opening for new item
      setFormData({
        category: '',
        condition: 'working',
        quantity: 1,
        location: '',
        dateAdded: new Date().toISOString().split('T')[0],
        description: '',
        bigBagWeight: 0,
        palletWeight: 0
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

  const netWeight = formData.quantity - formData.bigBagWeight - formData.palletWeight;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
                <Label className="text-sm text-gray-600">Metal Content:</Label>
                <MetalContentDisplay category={formData.category} className="mt-1" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="for-parts">For Parts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateAdded">Date Added</Label>
              <Input
                id="dateAdded"
                type="date"
                value={formData.dateAdded}
                onChange={(e) => handleInputChange('dateAdded', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Weight Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900">Weight Information (kg)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Total Weight (kg)</Label>
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
                <Label htmlFor="bigBagWeight">Big Bag Weight (kg)</Label>
                <Input
                  id="bigBagWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bigBagWeight}
                  onChange={(e) => handleInputChange('bigBagWeight', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="palletWeight">Pallet Weight (kg)</Label>
                <Input
                  id="palletWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.palletWeight}
                  onChange={(e) => handleInputChange('palletWeight', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            {(formData.bigBagWeight > 0 || formData.palletWeight > 0) && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Net Weight:</span>
                  <span className="text-lg font-bold text-green-600">{netWeight.toFixed(2)} kg</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Warehouse A-1, Storage Room B"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about the item..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
