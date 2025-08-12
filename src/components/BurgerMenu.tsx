import { useMemo, useState } from "react";
import { Menu, Cpu, MemoryStick, HardDrive, Package, Search as SearchIcon } from "lucide-react";
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
  const tTitle = language === "fr" ? "Composants" : "Komponentai";
  const tSearch = language === "fr" ? "Rechercher une catégorie…" : "Ieškoti kategorijos…";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{tTitle}</h2>
          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-full">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tSearch}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)] p-2">
          <div className="space-y-1">
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => onSelect("all")}
                data-active={selectedCategory == null}
                className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted data-[active=true]:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">{tAll}</span>
                </div>
                <Badge variant="secondary">{Object.values(counts).reduce((a, b) => a + b, 0)}</Badge>
              </button>
            </SheetClose>

            {filtered.map(({ raw, label, count }) => {
              const Icon = getIconForCategory(raw);
              const active = selectedCategory === raw;
              return (
                <SheetClose asChild key={raw}>
                  <button
                    type="button"
                    onClick={() => onSelect(raw)}
                    data-active={active}
                    className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted data-[active=true]:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    {count > 0 && <Badge variant="outline">{count}</Badge>}
                  </button>
                </SheetClose>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
