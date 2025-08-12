import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const CpuCatalogCleanupButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  const runCleanup = async () => {
    if (!window.confirm(
      "Confirmer le nettoyage du catalogue ?\n\n- Suppression: Athlon / Athlon X2 / Athlon X4 / Atom / Celeron / Pentium Gold / Pentium Silver\n- Suppression: tous les CPU sortis avant mi-2013"
    )) {
      return;
    }

    setLoading(true);
    toast.info("Nettoyage du catalogue CPU en cours…");
    try {
      const { data, error } = await supabase.functions.invoke("cpu-catalog-cleanup", {
        body: {},
      });
      if (error) {
        console.error("cpu-catalog-cleanup error:", error);
        toast.error("Échec du nettoyage du catalogue CPU.");
        return;
      }
      if (data && (data as any).success === false) {
        console.error("cpu-catalog-cleanup returned error:", (data as any).error);
        toast.error(`Erreur: ${(data as any).error ?? "échec de la fonction"}`);
        return;
      }
      const res = data as any;
      toast.success(
        `Nettoyage effectué: ${res?.totalDeleted ?? 0} éléments supprimés (AMD: ${res?.deleted?.amd_families ?? 0}, Intel: ${res?.deleted?.intel_families ?? 0}, < ${res?.deleted?.cutoff_date ?? ""}: ${res?.deleted?.older_than_cutoff ?? 0})`
      );
      // Invalider le cache des listes du catalogue
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cpuCatalogFamilies"] }),
        qc.invalidateQueries({ queryKey: ["cpuCatalogGenerations"] }),
        qc.invalidateQueries({ queryKey: ["cpuCatalogModels"] }),
      ]);
    } catch (e) {
      console.error("Invoke cpu-catalog-cleanup failed:", e);
      toast.error("Erreur lors de l'appel de la fonction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={runCleanup}
      disabled={loading}
      aria-label="Nettoyer le catalogue CPU"
      title="Nettoyer le catalogue CPU"
      className="h-9 w-9 lg:h-10 lg:w-auto lg:px-4"
    >
      <Trash2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      <span className="hidden lg:inline ml-2">
        {loading ? "Nettoyage..." : "Nettoyer le catalogue"}
      </span>
    </Button>
  );
};
