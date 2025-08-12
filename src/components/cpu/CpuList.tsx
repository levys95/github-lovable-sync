
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CpuInventoryRow = {
  id: string;
  brand: "INTEL" | "AMD";
  family: string;
  generation: string;
  model: string;
  base_clock_ghz: number | null;
  quantity: number;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export const CpuList: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cpuInventoryList"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cpu_inventory")
        .select("id, brand, family, generation, model, base_clock_ghz, quantity, location, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as CpuInventoryRow[];
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">Erreur lors du chargement du stock CPU.</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun processeur en stock pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((row) => {
        const freq = row.base_clock_ghz ? ` @ ${Number(row.base_clock_ghz).toFixed(2).replace(".", ",")} GHz` : "";
        return (
          <Card key={row.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{row.brand} • {row.family} • Gén {row.generation}</p>
                <p className="text-sm text-muted-foreground truncate">{row.model}{freq}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Qté: <span className="font-semibold">{row.quantity}</span></p>
                {row.location && <p className="text-xs text-muted-foreground">Loc: {row.location}</p>}
              </div>
            </div>
            {row.notes && <p className="text-xs text-muted-foreground mt-2">Notes: {row.notes}</p>}
          </Card>
        );
      })}
    </div>
  );
};
