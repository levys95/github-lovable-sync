import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Cpu } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CpuBrand = "INTEL" | "AMD";

type CatalogRow = {
  id: string;
  brand: CpuBrand;
  family: string;
  generation: string;
  model: string;
  base_clock_ghz: number | null;
};

const fetchFamilies = async (brand: CpuBrand | null) => {
  if (!brand) return [];
  const { data, error } = await supabase
    .from("cpu_catalog")
    .select("family, brand")
    .eq("brand", brand)
    .order("family", { ascending: true })
    .limit(10000);
  if (error) throw error;
  const uniq = Array.from(new Set((data || []).map((r) => r.family))).filter(Boolean);
  return uniq;
};

const fetchGenerations = async (brand: CpuBrand | null, family: string | null) => {
  if (!brand || !family) return [];
  const { data, error } = await supabase
    .from("cpu_catalog")
    .select("generation")
    .eq("brand", brand)
    .eq("family", family)
    .order("generation", { ascending: true })
    .limit(10000);
  if (error) throw error;
  const uniq = Array.from(new Set((data || []).map((r) => r.generation))).filter(Boolean);
  return uniq;
};

const fetchModels = async (brand: CpuBrand | null, family: string | null, generation: string | null) => {
  if (!brand || !family || !generation) return [];
  const { data, error } = await supabase
    .from("cpu_catalog")
    .select("id, brand, family, generation, model, base_clock_ghz")
    .eq("brand", brand)
    .eq("family", family)
    .eq("generation", generation)
    .order("model", { ascending: true })
    .limit(10000);
  if (error) throw error;
  return (data || []) as CatalogRow[];
};

export const CpuForm: React.FC = () => {
  const qc = useQueryClient();

  const [brand, setBrand] = useState<CpuBrand | null>(null);
  const [family, setFamily] = useState<string | null>(null);
  const [generation, setGeneration] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { data: families, isLoading: famLoading } = useQuery({
    queryKey: ["cpuCatalogFamilies", brand],
    queryFn: () => fetchFamilies(brand),
    enabled: !!brand,
    staleTime: 60_000,
  });

  const { data: generations, isLoading: genLoading } = useQuery({
    queryKey: ["cpuCatalogGenerations", brand, family],
    queryFn: () => fetchGenerations(brand, family),
    enabled: !!brand && !!family,
    staleTime: 60_000,
  });

  const { data: models, isLoading: modelLoading } = useQuery({
    queryKey: ["cpuCatalogModels", brand, family, generation],
    queryFn: () => fetchModels(brand, family, generation),
    enabled: !!brand && !!family && !!generation,
    staleTime: 60_000,
  });

  const selectedModel = useMemo(() => {
    if (!catalogId || !models) return null;
    return models.find((m) => m.id === catalogId) || null;
  }, [catalogId, models]);

  const addMutation = useMutation({
    mutationKey: ["cpuInventoryInsert"],
    mutationFn: async () => {
      if (!brand || !family || !generation || !selectedModel) {
        throw new Error("Veuillez sélectionner Marque, Gamme, Génération et Modèle.");
      }

      // Fetch the authenticated user to satisfy RLS and the required user_id column
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      const user = authData?.user;
      if (!user) {
        throw new Error("Vous devez être connecté pour ajouter un processeur.");
      }

      // Strongly type the insert payload to match Supabase types
      type CpuInventoryInsert = Database["public"]["Tables"]["cpu_inventory"]["Insert"];

      const payload: CpuInventoryInsert = {
        user_id: user.id,
        catalog_id: selectedModel.id,
        brand,
        family,
        generation,
        model: selectedModel.model,
        base_clock_ghz: selectedModel.base_clock_ghz ?? null,
        quantity,
        location: location || null,
        notes: notes || null,
      };

      const { error } = await supabase.from("cpu_inventory").insert(payload);
      if (error) throw error;
      return true;
    },
    onSuccess: async () => {
      toast.success("Processeur ajouté au stock");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cpuInventoryList"] }),
      ]);
      setQuantity(1);
      setLocation("");
      setNotes("");
    },
    onError: (err: any) => {
      console.error("Insert cpu_inventory error:", err);
      toast.error("Impossible d'ajouter le processeur. Vérifiez votre sélection et votre connexion.");
    },
  });

  const resetFromBrand = () => {
    setFamily(null);
    setGeneration(null);
    setCatalogId(null);
  };

  const resetFromFamily = () => {
    setGeneration(null);
    setCatalogId(null);
  };

  const resetFromGeneration = () => {
    setCatalogId(null);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Ajouter au stock</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marque</Label>
          <Select
            value={brand || ""}
            onValueChange={(v) => {
              setBrand(v as CpuBrand);
              resetFromBrand();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une marque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTEL">Intel</SelectItem>
              <SelectItem value="AMD">AMD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Gamme</Label>
          <Select
            value={family || ""}
            onValueChange={(v) => {
              setFamily(v);
              resetFromFamily();
            }}
            disabled={!brand || famLoading || !families?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={brand ? (famLoading ? "Chargement..." : (families?.length ? "Choisir une gamme" : "Aucune donnée")) : "Choisir d'abord la marque"} />
            </SelectTrigger>
            <SelectContent>
              {(families || []).map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Génération</Label>
          <Select
            value={generation || ""}
            onValueChange={(v) => {
              setGeneration(v);
              resetFromGeneration();
            }}
            disabled={!family || genLoading || !generations?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={family ? (genLoading ? "Chargement..." : (generations?.length ? "Choisir une génération" : "Aucune donnée")) : "Choisir d'abord la gamme"} />
            </SelectTrigger>
            <SelectContent>
              {(generations || []).map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Modèle</Label>
          <Select
            value={catalogId || ""}
            onValueChange={(v) => setCatalogId(v)}
            disabled={!generation || modelLoading || !models?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={generation ? (modelLoading ? "Chargement..." : (models?.length ? "Choisir un modèle" : "Aucune donnée")) : "Choisir d'abord la génération"} />
            </SelectTrigger>
            <SelectContent>
              {(models || []).map((m) => {
                const freq = m.base_clock_ghz ? ` @ ${m.base_clock_ghz.toFixed(2).replace(".", ",")} GHz` : "";
                return (
                  <SelectItem key={m.id} value={m.id}>
                    {m.model}{freq}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Quantité</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />
        </div>

        <div className="space-y-2">
          <Label>Emplacement</Label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Allée A, étagère 3"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Notes</Label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Infos supplémentaires"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || !brand || !family || !generation || !catalogId}
        >
          {addMutation.isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </div>

      {!brand && (
        <p className="text-sm text-muted-foreground">
          Commencez par choisir la marque, puis la gamme, la génération et enfin le modèle exact.
        </p>
      )}

      {brand && families && families.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Le catalogue est vide pour cette marque. Nous pourrons l'importer automatiquement (Intel/AMD) si vous le souhaitez.
        </p>
      )}
    </Card>
  );
};
