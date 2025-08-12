
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type Row = {
  brand: "INTEL" | "AMD";
  quantity: number;
};

export const CpuOverviewPanels: React.FC = () => {
  const { data } = useQuery({
    queryKey: ["cpuInventoryListOverview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cpu_inventory")
        .select("brand, quantity")
        .limit(10000);
      if (error) throw error;
      return (data || []) as Row[];
    },
    staleTime: 20_000,
  });

  const { total, intel, amd } = useMemo(() => {
    const rows = data || [];
    const total = rows.reduce((acc, r) => acc + (r.quantity || 0), 0);
    const intel = rows.filter((r) => r.brand === "INTEL").reduce((a, r) => a + (r.quantity || 0), 0);
    const amd = rows.filter((r) => r.brand === "AMD").reduce((a, r) => a + (r.quantity || 0), 0);
    return { total, intel, amd };
  }, [data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Total CPU</p>
        <p className="text-2xl font-semibold">{total}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Intel</p>
        <p className="text-2xl font-semibold">{intel}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">AMD</p>
        <p className="text-2xl font-semibold">{amd}</p>
      </Card>
    </div>
  );
};
