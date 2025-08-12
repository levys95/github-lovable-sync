import { useMemo, useState, useEffect } from "react";
import { Menu, Cpu, MemoryStick, HardDrive, Package, Search as SearchIcon, Home, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { componentCategories } from "@/constants/componentsCatalog";
import { supabase } from "@/integrations/supabase/client";

export interface BurgerMenuProps {
  categories: string[];
  selectedCategory: string | null;
  counts: Record<string, number>;
  totalCount?: number;
  onSelect: (category: string | "all") => void;
}

// Category icons now come from componentCategories

export function BurgerMenu({ categories, selectedCategory, counts, totalCount, onSelect }: BurgerMenuProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [isComponentsOpen, setIsComponentsOpen] = useState(true);

// Stock counts per component id
  const [countsMap, setCountsMap] = useState<Record<string, number>>({});
  const [totalComponents, setTotalComponents] = useState<number>(0);

  useEffect(() => {
    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();

    const mapLabelToId: Record<string, string> = {};
    componentCategories.forEach((cat) => {
      if (cat.id === 'ram' || cat.id === 'processors') return;
      mapLabelToId[normalize(cat.name)] = cat.id;
      mapLabelToId[normalize(cat.nameLt)] = cat.id;
    });

    const loadCounts = async () => {
      try {
        const [ramRes, cpuRes, itemsRes] = await Promise.all([
          supabase.from('ram_modules').select('quantity').limit(10000),
          supabase.from('cpu_inventory').select('quantity').limit(10000),
          supabase.from('inventory_items').select('category, quantity').limit(10000),
        ]);

        const counts: Record<string, number> = {};

        // RAM
        const ramSum = (ramRes.data || []).reduce((acc: number, r: any) => acc + (Number(r.quantity) || 0), 0);
        counts['ram'] = ramSum;

        // Processors
        const cpuSum = (cpuRes.data || []).reduce((acc: number, r: any) => acc + (Number(r.quantity) || 0), 0);
        counts['processors'] = cpuSum;

        // Other components from inventory_items
        (itemsRes.data || []).forEach((row: any) => {
          const id = row.category ? mapLabelToId[normalize(row.category)] : undefined;
          if (!id) return;
          const qty = Number(row.quantity) || 0;
          counts[id] = (counts[id] || 0) + qty;
        });

        // Ensure all categories exist in the map
        componentCategories.forEach((cat) => {
          counts[cat.id] = counts[cat.id] || 0;
        });

        setCountsMap(counts);
        setTotalComponents(Object.values(counts).reduce((a, b) => a + b, 0));
      } catch (e) {
        console.error('BurgerMenu count load error:', e);
      }
    };

    loadCounts();
  }, [language]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = componentCategories.map((cat) => ({
      id: cat.id,
      label: language === 'fr' ? cat.name : cat.nameLt,
      route: cat.route,
      Icon: cat.icon,
      count: countsMap[cat.id] || 0,
    }));
    const filteredList = q ? list.filter((l) => l.label.toLowerCase().includes(q)) : list;
    return filteredList;
  }, [query, language, countsMap]);

  const tAll = language === "fr" ? "Tous les composants" : "Visi komponentai";
  const tTitle = language === "fr" ? "Navigation" : "Navigacija";
  const tSearch = language === "fr" ? "Rechercher une catégorie…" : "Ieškoti kategorijos…";
  const tOverview = language === "fr" ? "Vue d'ensemble" : "Apžvalga";
  const tComponents = language === "fr" ? "Composants" : "Komponentai";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu" className="h-14 w-14">
          <Menu className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[96vw] sm:w-[32rem] p-0">
        <div className="p-6 border-b">
          <h2 className="text-3xl font-semibold">{tTitle}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tSearch}
                className="h-12 pl-12 text-base"
              />
            </div>
          </div>
        </div>

        <div className="h-[calc(100dvh-120px)] sm:h-[calc(100vh-120px)] p-3">
          <div className="space-y-1">
            {/* Vue d'ensemble */}
            <SheetClose asChild>
              <Link
                to="/"
                className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted data-[active=true]:bg-muted"
              >
                <div className="flex items-center gap-4">
                  <Home className="h-6 w-6" />
                  <span className="text-lg font-medium">{tOverview}</span>
                </div>
              </Link>
            </SheetClose>

            {/* Section Composants */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsComponentsOpen(!isComponentsOpen)}
                className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted"
              >
                <div className="flex items-center gap-4">
                  <Package className="h-6 w-6" />
                  <span className="text-lg font-medium">{tComponents}</span>
                </div>
                {isComponentsOpen ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>

              {isComponentsOpen && (
                <ScrollArea className="ml-6 pr-2 h-[60vh]">
                  <div className="space-y-1 pb-8">
                    {/* Tous les composants */}
                    <SheetClose asChild>
                      <Link
                        to="/components"
                        className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted"
                      >
                        <div className="flex items-center gap-4">
                          <Package className="h-5 w-5" />
                          <span className="text-base font-medium">{tAll}</span>
                        </div>
                        <Badge variant="secondary" className="px-2 py-1 text-sm">{totalComponents}</Badge>
                      </Link>
                    </SheetClose>

                    {/* Liste des composants */}
                    {filtered.map(({ id, label, route, Icon, count }) => (
                      <SheetClose asChild key={id}>
                        <Link
                          to={route}
                          className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted"
                        >
                          <div className="flex items-center gap-4">
                            <Icon className="h-5 w-5" />
                            <span className="text-base font-medium">{label}</span>
                          </div>
                          <Badge variant="outline" className="px-2 py-1 text-sm">{count}</Badge>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
