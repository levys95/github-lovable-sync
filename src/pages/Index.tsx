import { useState } from 'react';
import { Plus, Search, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ItemDialog } from '@/components/ItemDialog';
import { ItemCard } from '@/components/ItemCard';
import { PPMDisplay } from '@/components/PPMDisplay';
import { calculateTotalPPM } from '@/utils/ppmCalculations';

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

const Index = () => {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'iPhone 12',
      category: 'Smartphones',
      condition: 'ready',
      quantity: 15.5,
      location: 'Warehouse A-1',
      dateAdded: '2024-01-15',
      brand: 'Apple',
      model: 'iPhone 12',
      description: 'Working smartphones ready for refurbishment',
      bigBagWeight: 1.2,
      palletWeight: 0.8,
      images: [],
      shipmentNumber: 'SH-2024-001'
    },
    {
      id: '2',
      name: 'Samsung Galaxy Screen',
      category: 'Gsm a touches',
      condition: 'waiting-sorting',
      quantity: 8.3,
      location: 'Warehouse B-2',
      dateAdded: '2024-01-20',
      brand: 'Samsung',
      description: 'Touch screens for mobile devices',
      bigBagWeight: 0.5,
      images: [],
      shipmentNumber: 'SH-2024-002'
    },
    {
      id: '3',
      name: 'Generic Phone Parts',
      category: 'China Phone',
      condition: 'unknown',
      quantity: 12.1,
      location: 'Warehouse C-1',
      dateAdded: '2024-01-18',
      description: 'Various Chinese phone components',
      images: [],
      shipmentNumber: 'SH-2024-003'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const categories = [
    'all', 
    'Smartphones', 
    'Gsm a touches', 
    'China Phone', 
    'power supply full', 
    'hdd full', 
    '15 au', 
    '30 au', 
    '50 au', 
    '100 au', 
    '150 au', 
    '200 au', 
    '250 au', 
    '300 au', 
    '350 au', 
    '400 au', 
    '800 au', 
    '1000 +', 
    'full cdrom'
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.shipmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics for each condition
  const readyItems = items.filter(item => item.condition === 'ready');
  const waitingSortingItems = items.filter(item => item.condition === 'waiting-sorting');
  const unknownItems = items.filter(item => item.condition === 'unknown');

  const readyWeight = readyItems.reduce((sum, item) => sum + item.quantity, 0);
  const readyNetWeight = readyItems.reduce((sum, item) => {
    const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
    return sum + netWeight;
  }, 0);

  const waitingSortingWeight = waitingSortingItems.reduce((sum, item) => sum + item.quantity, 0);
  const waitingSortingNetWeight = waitingSortingItems.reduce((sum, item) => {
    const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
    return sum + netWeight;
  }, 0);

  const unknownWeight = unknownItems.reduce((sum, item) => sum + item.quantity, 0);
  const unknownNetWeight = unknownItems.reduce((sum, item) => {
    const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
    return sum + netWeight;
  }, 0);

  // Calculate total statistics
  const totalWeight = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalNetWeight = items.reduce((sum, item) => {
    const netWeight = item.quantity - (item.bigBagWeight || 0) - (item.palletWeight || 0);
    return sum + netWeight;
  }, 0);

  // Calculate PPM for each condition
  const readyPPM = calculateTotalPPM(readyItems);
  const waitingSortingPPM = calculateTotalPPM(waitingSortingItems);
  const unknownPPM = calculateTotalPPM(unknownItems);
  const totalPPM = calculateTotalPPM(items);

  const handleAddItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString()
    };
    setItems([...items, item]);
    setIsDialogOpen(false);
  };

  const handleEditItem = (updatedItem: InventoryItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/f49dc73c-6cdf-40f2-8469-c10cb8d64b09.png" 
                alt="SFDE Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">E-Waste Warehouse Manager</h1>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Ready Items */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg font-bold text-green-800">Ready Items</CardTitle>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-green-900 mb-1">{readyWeight.toFixed(1)} KG</div>
                <p className="text-sm text-green-600 font-medium">Gross Weight</p>
                <p className="text-xs text-green-500">Net: {readyNetWeight.toFixed(1)} kg</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center border">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(readyPPM.Ag)}</div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                  <div className="text-xs text-gray-500">ppm</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(readyPPM.Pd)}</div>
                  <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                  <div className="text-xs text-blue-500">ppm</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(readyPPM.Au)}</div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                  <div className="text-xs text-yellow-500">ppm</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(readyPPM.Cu)}%</div>
                  <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                  <div className="text-xs text-orange-500">percent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waiting Sorting Items */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg font-bold text-yellow-800">Waiting Sorting</CardTitle>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-yellow-900 mb-1">{waitingSortingWeight.toFixed(1)} KG</div>
                <p className="text-sm text-yellow-600 font-medium">Gross Weight</p>
                <p className="text-xs text-yellow-500">Net: {waitingSortingNetWeight.toFixed(1)} kg</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center border">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(waitingSortingPPM.Ag)}</div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                  <div className="text-xs text-gray-500">ppm</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(waitingSortingPPM.Pd)}</div>
                  <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                  <div className="text-xs text-blue-500">ppm</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(waitingSortingPPM.Au)}</div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                  <div className="text-xs text-yellow-500">ppm</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(waitingSortingPPM.Cu)}%</div>
                  <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                  <div className="text-xs text-orange-500">percent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unknown Items */}
          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-bold text-gray-800">Unknown Items</CardTitle>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-1">{unknownWeight.toFixed(1)} KG</div>
                <p className="text-sm text-gray-600 font-medium">Gross Weight</p>
                <p className="text-xs text-gray-500">Net: {unknownNetWeight.toFixed(1)} kg</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center border">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(unknownPPM.Ag)}</div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                  <div className="text-xs text-gray-500">ppm</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(unknownPPM.Pd)}</div>
                  <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                  <div className="text-xs text-blue-500">ppm</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(unknownPPM.Au)}</div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                  <div className="text-xs text-yellow-500">ppm</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(unknownPPM.Cu)}%</div>
                  <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                  <div className="text-xs text-orange-500">percent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Items */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-bold text-purple-800">Total Items</CardTitle>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-purple-900 mb-1">{totalWeight.toFixed(1)} KG</div>
                <p className="text-sm text-purple-600 font-medium">Gross Weight</p>
                <p className="text-xs text-purple-500">Net: {totalNetWeight.toFixed(1)} kg</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center border">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(totalPPM.Ag)}</div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                  <div className="text-xs text-gray-500">ppm</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(totalPPM.Pd)}</div>
                  <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                  <div className="text-xs text-blue-500">ppm</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(totalPPM.Au)}</div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                  <div className="text-xs text-yellow-500">ppm</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(totalPPM.Cu)}%</div>
                  <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                  <div className="text-xs text-orange-500">percent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items, brands, models, or shipment numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first inventory item.'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => openEditDialog(item)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Item Dialog */}
      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={editingItem ? handleEditItem : handleAddItem}
        item={editingItem}
        categories={categories.filter(cat => cat !== 'all')}
      />
    </div>
  );
};

export default Index;
