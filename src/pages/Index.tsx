import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Package, Clock, AlertTriangle, BarChart3, ChevronLeft, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemDialog } from '@/components/ItemDialog';
import { ItemCard } from '@/components/ItemCard';
import { PPMDisplay } from '@/components/PPMDisplay';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateTotalPPM } from '@/utils/ppmCalculations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  // Force rebuild to clear cache - v2
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Load categories from Supabase with fallback
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) throw error;

      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories for demo
      setCategories(['Telefoni', 'Kompiuteriai', 'Televizoriai', 'Kita elektronika']);
    }
  };

  // Load items from Supabase (without images for performance)
  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, category, condition, quantity, location, date_added, description, brand, big_bag_weight, pallet_weight, shipment_number')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Transform database format to component format
      const transformedItems = data?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        condition: item.condition as 'ready' | 'waiting-sorting' | 'unknown',
        quantity: parseFloat(item.quantity.toString()),
        location: item.location,
        date_added: item.date_added,
        description: item.description,
        brand: item.brand,
        big_bag_weight: item.big_bag_weight ? parseFloat(item.big_bag_weight.toString()) : undefined,
        pallet_weight: item.pallet_weight ? parseFloat(item.pallet_weight.toString()) : undefined,
        images: [],
        shipment_number: item.shipment_number,
      })) || [];

      setItems(transformedItems);
      
      // Don't load images immediately to avoid timeout
      // Images will be loaded on demand when cards become visible
    } catch (error) {
      console.error('Error loading items:', error);
      // Don't show error toast for connection issues - just log
      // Use demo data when Supabase is not available
      setItems([]);
    }
  };

  // Update item images when they are loaded
  const handleImagesLoaded = (itemId: string, images: string[]) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, images } : item
      )
    );
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadCategories(), loadItems()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);


  // Memoized filtering for performance
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  // Paginated items for performance
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Memoized statistics calculations for performance
  const statistics = useMemo(() => {
    const readyItems = items.filter(item => item.condition === 'ready');
    const waitingSortingItems = items.filter(item => item.condition === 'waiting-sorting');
    const unknownItems = items.filter(item => item.condition === 'unknown');

    const readyWeight = readyItems.reduce((sum, item) => sum + item.quantity, 0);
    const readyNetWeight = readyItems.reduce((sum, item) => {
      const netWeight = item.quantity - (item.big_bag_weight || 0) - (item.pallet_weight || 0);
      return sum + netWeight;
    }, 0);

    const waitingSortingWeight = waitingSortingItems.reduce((sum, item) => sum + item.quantity, 0);
    const waitingSortingNetWeight = waitingSortingItems.reduce((sum, item) => {
      const netWeight = item.quantity - (item.big_bag_weight || 0) - (item.pallet_weight || 0);
      return sum + netWeight;
    }, 0);

    const unknownWeight = unknownItems.reduce((sum, item) => sum + item.quantity, 0);
    const unknownNetWeight = unknownItems.reduce((sum, item) => {
      const netWeight = item.quantity - (item.big_bag_weight || 0) - (item.pallet_weight || 0);
      return sum + netWeight;
    }, 0);

    const totalWeight = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalNetWeight = items.reduce((sum, item) => {
      const netWeight = item.quantity - (item.big_bag_weight || 0) - (item.pallet_weight || 0);
      return sum + netWeight;
    }, 0);

    return {
      readyItems,
      waitingSortingItems,
      unknownItems,
      readyWeight,
      readyNetWeight,
      waitingSortingWeight,
      waitingSortingNetWeight,
      unknownWeight,
      unknownNetWeight,
      totalWeight,
      totalNetWeight
    };
  }, [items]);

  // Memoized PPM calculations
  const ppmData = useMemo(() => ({
    readyPPM: calculateTotalPPM(statistics.readyItems),
    waitingSortingPPM: calculateTotalPPM(statistics.waitingSortingItems),
    unknownPPM: calculateTotalPPM(statistics.unknownItems),
    totalPPM: calculateTotalPPM(items)
  }), [statistics.readyItems, statistics.waitingSortingItems, statistics.unknownItems, items]);

  const handleAddItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    try {
      // Transform component format to database format
      const dbItem = {
        name: newItem.name,
        category: newItem.category,
        condition: newItem.condition,
        quantity: newItem.quantity,
        location: newItem.location,
        date_added: newItem.date_added,
        description: newItem.description,
        brand: newItem.brand,
        big_bag_weight: newItem.big_bag_weight,
        pallet_weight: newItem.pallet_weight,
        images: newItem.images || [],
        shipment_number: newItem.shipment_number,
      };

      const { error } = await supabase
        .from('inventory_items')
        .insert([dbItem]);

      if (error) throw error;

      toast({
        title: "Sėkmė",
        description: "Prekė sėkmingai pridėta",
      });

      setIsDialogOpen(false);
      loadItems(); // Reload items
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko pridėti prekės",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async (updatedItem: InventoryItem) => {
    try {
      // Transform component format to database format
      const dbItem = {
        name: updatedItem.name,
        category: updatedItem.category,
        condition: updatedItem.condition,
        quantity: updatedItem.quantity,
        location: updatedItem.location,
        date_added: updatedItem.date_added,
        description: updatedItem.description,
        brand: updatedItem.brand,
        big_bag_weight: updatedItem.big_bag_weight,
        pallet_weight: updatedItem.pallet_weight,
        images: updatedItem.images || [],
        shipment_number: updatedItem.shipment_number,
      };

      const { error } = await supabase
        .from('inventory_items')
        .update(dbItem)
        .eq('id', updatedItem.id);

      if (error) throw error;

      toast({
        title: "Sėkmė",
        description: "Prekė sėkmingai atnaujinta",
      });

      setSelectedItem(null);
      setIsDialogOpen(false);
      loadItems(); // Reload items
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti prekės",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sėkmė",
        description: "Prekė sėkmingai ištrinta",
      });

      loadItems(); // Reload items
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti prekės",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg">Kraunama...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/f49dc73c-6cdf-40f2-8469-c10cb8d64b09.png" 
                alt="Logo SFDE" 
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>{t('header.addItem')}</span>
              </Button>
            </div>
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
                <CardTitle className="text-lg font-bold text-green-800">{t('stats.ready')}</CardTitle>
              </div>
               <div className="bg-white rounded-lg p-4 shadow-sm">
                 <div className="text-3xl font-bold text-green-900 mb-1">{statistics.readyWeight.toFixed(1)} KG</div>
                 <p className="text-sm text-green-600 font-medium">{t('stats.grossWeight')}</p>
                 <p className="text-xs text-green-500">{t('stats.netWeight')}: {statistics.readyNetWeight.toFixed(1)} kg</p>
               </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-lg p-3 text-center border">
                   <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(ppmData.readyPPM.Ag)}</div>
                   <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                   <div className="text-xs text-gray-500">ppm</div>
                 </div>
                 
                 <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                   <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(ppmData.readyPPM.Pd)}</div>
                   <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                   <div className="text-xs text-blue-500">ppm</div>
                 </div>
                 
                 <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                   <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(ppmData.readyPPM.Au)}</div>
                   <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                   <div className="text-xs text-yellow-500">ppm</div>
                 </div>
                 
                 <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                   <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(ppmData.readyPPM.Cu)}%</div>
                   <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                   <div className="text-xs text-orange-500">pourcent</div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Waiting Sorting Items */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg font-bold text-yellow-800">{t('stats.waiting')}</CardTitle>
              </div>
               <div className="bg-white rounded-lg p-4 shadow-sm">
                 <div className="text-3xl font-bold text-yellow-900 mb-1">{statistics.waitingSortingWeight.toFixed(1)} KG</div>
                 <p className="text-sm text-yellow-600 font-medium">{t('stats.grossWeight')}</p>
                 <p className="text-xs text-yellow-500">{t('stats.netWeight')}: {statistics.waitingSortingNetWeight.toFixed(1)} kg</p>
               </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-lg p-3 text-center border">
                   <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(ppmData.waitingSortingPPM.Ag)}</div>
                   <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                   <div className="text-xs text-gray-500">ppm</div>
                 </div>
                 
                 <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                   <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(ppmData.waitingSortingPPM.Pd)}</div>
                   <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                   <div className="text-xs text-blue-500">ppm</div>
                 </div>
                 
                 <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                   <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(ppmData.waitingSortingPPM.Au)}</div>
                   <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                   <div className="text-xs text-yellow-500">ppm</div>
                 </div>
                 
                 <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                   <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(ppmData.waitingSortingPPM.Cu)}%</div>
                   <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                   <div className="text-xs text-orange-500">pourcent</div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Unknown Items */}
          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-bold text-gray-800">{t('stats.unknown')}</CardTitle>
              </div>
               <div className="bg-white rounded-lg p-4 shadow-sm">
                 <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.unknownWeight.toFixed(1)} KG</div>
                 <p className="text-sm text-gray-600 font-medium">{t('stats.grossWeight')}</p>
                 <p className="text-xs text-gray-500">{t('stats.netWeight')}: {statistics.unknownNetWeight.toFixed(1)} kg</p>
               </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-lg p-3 text-center border">
                   <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(ppmData.unknownPPM.Ag)}</div>
                   <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                   <div className="text-xs text-gray-500">ppm</div>
                 </div>
                 
                 <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                   <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(ppmData.unknownPPM.Pd)}</div>
                   <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                   <div className="text-xs text-blue-500">ppm</div>
                 </div>
                 
                 <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                   <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(ppmData.unknownPPM.Au)}</div>
                   <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                   <div className="text-xs text-yellow-500">ppm</div>
                 </div>
                 
                 <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                   <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(ppmData.unknownPPM.Cu)}%</div>
                   <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                   <div className="text-xs text-orange-500">pourcent</div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Items */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-bold text-purple-800">{t('stats.total')}</CardTitle>
              </div>
               <div className="bg-white rounded-lg p-4 shadow-sm">
                 <div className="text-3xl font-bold text-purple-900 mb-1">{statistics.totalWeight.toFixed(1)} KG</div>
                 <p className="text-sm text-purple-600 font-medium">{t('stats.grossWeight')}</p>
                 <p className="text-xs text-purple-500">{t('stats.netWeight')}: {statistics.totalNetWeight.toFixed(1)} kg</p>
               </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-lg p-3 text-center border">
                   <div className="text-2xl font-bold text-gray-800 mb-1">{Math.round(ppmData.totalPPM.Ag)}</div>
                   <div className="text-xs font-medium text-gray-600 mb-1">Ag:</div>
                   <div className="text-xs text-gray-500">ppm</div>
                 </div>
                 
                 <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                   <div className="text-2xl font-bold text-blue-800 mb-1">{Math.round(ppmData.totalPPM.Pd)}</div>
                   <div className="text-xs font-medium text-blue-600 mb-1">Pd:</div>
                   <div className="text-xs text-blue-500">ppm</div>
                 </div>
                 
                 <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                   <div className="text-2xl font-bold text-yellow-800 mb-1">{Math.round(ppmData.totalPPM.Au)}</div>
                   <div className="text-xs font-medium text-yellow-600 mb-1">Au:</div>
                   <div className="text-xs text-yellow-500">ppm</div>
                 </div>
                 
                 <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                   <div className="text-2xl font-bold text-orange-800 mb-1">{Math.round(ppmData.totalPPM.Cu)}%</div>
                   <div className="text-xs font-medium text-orange-600 mb-1">Cu:</div>
                   <div className="text-xs text-orange-500">pourcent</div>
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
              placeholder={t('search.placeholder')}
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
            <option value="all">{t('filter.allCategories')}</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? t('empty.description')
                  : t('empty.descriptionNoItems')
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('empty.addFirst')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => openEditDialog(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                  onImagesLoaded={handleImagesLoaded}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Ankstesnis
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPage} iš {totalPages} ({filteredItems.length} prekių)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Kitas
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add/Edit Item Dialog */}
      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedItem(null);
        }}
        onSave={selectedItem ? handleEditItem : handleAddItem}
        item={selectedItem}
        categories={categories.filter(cat => cat !== 'all')}
      />
    </div>
  );
};

export default Index;