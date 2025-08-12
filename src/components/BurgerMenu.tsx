import { useMemo, useState } from "react";
import { Menu, Cpu, MemoryStick, HardDrive, Package, Search as SearchIcon, Home, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateCategoryLabel } from "@/utils/category-i18n";

export interface BurgerMenuProps {
  categories: string[];
  selectedCategory: string | null;
  counts: Record<string, number>;
  onSelect: (category: string | "all") => void;
}

const getIconForCategory = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes("cpu") || c.includes("processeur") || c.includes("processeur") || c.includes("processor")) return Cpu;
  if (c.includes("ram") || c.includes("mémoire") || c.includes("memoire") || c.includes("memory")) return MemoryStick;
  if (c.includes("disque") || c.includes("hdd") || c.includes("ssd") || c.includes("hard")) return HardDrive;
  return Package;
};

export function BurgerMenu({ categories, selectedCategory, counts, onSelect }: BurgerMenuProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [isComponentsOpen, setIsComponentsOpen] = useState(true);

  const labels = useMemo(() => {
    return categories.map((c) => ({
      raw: c,
      label: translateCategoryLabel(c, language),
      count: counts[c] || 0,
    }));
  }, [categories, counts, language]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? labels.filter((l) => l.label.toLowerCase().includes(q))
      : labels;
    return list.sort((a, b) => a.label.localeCompare(b.label));
  }, [labels, query]);

  const tAll = language === "fr" ? "Tous les composants" : "Visi komponentai";
  const tTitle = language === "fr" ? "Navigation" : "Navigacija";
  const tSearch = language === "fr" ? "Rechercher une catégorie…" : "Ieškoti kategorijos…";
  const tRam = language === "fr" ? "Stock RAM" : "RAM atsargos";
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
                <div className="ml-6 space-y-1">
                  {/* Tous les composants */}
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={() => onSelect("all")}
                      data-active={selectedCategory == null}
                      className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted data-[active=true]:bg-muted"
                    >
                      <div className="flex items-center gap-4">
                        <Package className="h-5 w-5" />
                        <span className="text-base font-medium">{tAll}</span>
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 text-sm">{Object.values(counts).reduce((a, b) => a + b, 0)}</Badge>
                    </button>
                  </SheetClose>

                  {/* Stock RAM */}
                  <SheetClose asChild>
                    <Link
                      to="/ram"
                      className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted"
                    >
                      <div className="flex items-center gap-4">
                        <MemoryStick className="h-5 w-5" />
                        <span className="text-base font-medium">{tRam}</span>
                      </div>
                    </Link>
                  </SheetClose>

                  {/* Autres catégories */}
                  {filtered.map(({ raw, label, count }) => {
                    const Icon = getIconForCategory(raw);
                    const active = selectedCategory === raw;
                    return (
                      <SheetClose asChild key={raw}>
                        <button
                          type="button"
                          onClick={() => onSelect(raw)}
                          data-active={active}
                          className="w-full flex items-center justify-between rounded-xl px-5 py-4 hover:bg-muted data-[active=true]:bg-muted"
                        >
                          <div className="flex items-center gap-4">
                            <Icon className="h-5 w-5" />
                            <span className="text-base font-medium">{label}</span>
                          </div>
                          {count > 0 && <Badge variant="outline" className="px-2 py-1 text-sm">{count}</Badge>}
                        </button>
                      </SheetClose>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
