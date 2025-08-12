
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const CpuCatalogSyncButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  const runSync = async () => {
    setLoading(true);
    toast.info("Mise à jour du catalogue CPU lancée…");
    try {
      const { data, error } = await supabase.functions.invoke("cpu-catalog-sync", {
        body: { scope: "all" },
      });
      if (error) {
        console.error("cpu-catalog-sync error:", error);
        toast.error("Échec de la mise à jour du catalogue CPU.");
        return;
      }
      console.log("cpu-catalog-sync result:", data);
      toast.success(`Catalogue mis à jour (${data?.inserted || 0} nouveaux modèles)`);
      // Invalider le cache des listes du catalogue
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cpuCatalogFamilies"] }),
        qc.invalidateQueries({ queryKey: ["cpuCatalogGenerations"] }),
        qc.invalidateQueries({ queryKey: ["cpuCatalogModels"] }),
      ]);
    } catch (e) {
      console.error("Invoke cpu-catalog-sync failed:", e);
      toast.error("Erreur lors de l'appel de la fonction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={runSync} disabled={loading}>
      <RotateCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Mise à jour..." : "Mettre à jour le catalogue CPU"}
    </Button>
  );
};
