import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const CpuCatalogCoverage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["cpuCatalogCoverage"],
    queryFn: async () => {
      const [intelCountRes, amdCountRes, rowsRes, lastRes] = await Promise.all([
        supabase.from("cpu_catalog").select("id", { count: "exact", head: true }).eq("brand", "INTEL"),
        supabase.from("cpu_catalog").select("id", { count: "exact", head: true }).eq("brand", "AMD"),
        supabase.from("cpu_catalog").select("brand,family").limit(20000),
        supabase.from("cpu_catalog").select("updated_at").order("updated_at", { ascending: false }).limit(1),
      ]);

      const intelTotal = intelCountRes.count || 0;
      const amdTotal = amdCountRes.count || 0;
      const rows = (rowsRes.data || []) as { brand: "INTEL" | "AMD"; family: string }[];
      const intelFamilies = new Set(rows.filter(r => r.brand === "INTEL").map(r => r.family));
      const amdFamilies = new Set(rows.filter(r => r.brand === "AMD").map(r => r.family));
      const lastUpdatedAt = (lastRes.data?.[0]?.updated_at as string | undefined) || null;

      return {
        intelTotal,
        amdTotal,
        intelFamilies: intelFamilies.size,
        amdFamilies: amdFamilies.size,
        lastUpdatedAt,
      };
    },
    staleTime: 20_000,
  });

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center text-sm">
        <div>
          <p className="text-muted-foreground">Intel (modèles)</p>
          <p className="text-xl font-semibold">{isLoading ? "…" : data?.intelTotal ?? 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground">AMD (modèles)</p>
          <p className="text-xl font-semibold">{isLoading ? "…" : data?.amdTotal ?? 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Familles Intel</p>
          <p className="text-xl font-semibold">{isLoading ? "…" : data?.intelFamilies ?? 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Familles AMD</p>
          <p className="text-xl font-semibold">{isLoading ? "…" : data?.amdFamilies ?? 0}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-muted-foreground">Dernière mise à jour</p>
          <p className="text-sm font-medium truncate">
            {isLoading ? "…" : data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleString() : "—"}
          </p>
        </div>
      </div>
    </Card>
  );
};
