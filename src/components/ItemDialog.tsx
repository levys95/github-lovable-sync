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
    description: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category,
        condition: item.condition,
        quantity: item.quantity,
        location: item.location,
        dateAdded: item.dateAdded,
        description: item.description || ''
      });
    } else if (isOpen) {
      // Reset form when opening for new item
      setFormData({
        category: '',
        condition: 'working',
        quantity: 1,
        location: '',
        dateAdded: new Date().toISOString().split('T')[0],
        description: ''
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
              />
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
