import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

let _supabase: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!_supabase) {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    _supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  }
  return _supabase;
}

async function deleteByFamilies(brand: "INTEL" | "AMD", families: string[]) {
  if (families.length === 0) return { count: 0 };
  const { data, error } = await getClient()
    .from("cpu_catalog")
    .delete()
    .in("family", families)
    .eq("brand", brand)
    .select("id");
  if (error) {
    console.error(`[cleanup] Delete ${brand} families failed:`, error);
    throw error;
  }
  return { count: (data as any[])?.length || 0 };
}

async function deleteOlderThan(dateISO: string) {
  const { data, error } = await getClient()
    .from("cpu_catalog")
    .delete()
    .lt("release_date", dateISO)
    .not("release_date", "is", null)
    .select("id");
  if (error) {
    console.error(`[cleanup] Delete older than ${dateISO} failed:`, error);
    throw error;
  }
  return { count: (data as any[])?.length || 0 };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional body for future extension
    const body = await req.json().catch(() => ({}));
    console.log("[cpu-catalog-cleanup] Start with body:", body);

    // 1) Delete specific AMD and INTEL families
    const amdFamilies = ["Athlon", "Athlon X2", "Athlon X4"];
    const intelFamilies = ["Atom", "Celeron", "Pentium Gold", "Pentium Silver"];

    const [amdRes, intelRes] = await Promise.all([
      deleteByFamilies("AMD", amdFamilies),
      deleteByFamilies("INTEL", intelFamilies),
    ]);

    // 2) Delete everything released before (approx.) Intel Core 4th gen time frame
    // Haswell (4th gen) launched in 2013. Use mid-2013 as a cutoff date
    const cutoff = "2013-06-01";
    const olderRes = await deleteOlderThan(cutoff);

    const result = {
      success: true,
      deleted: {
        amd_families: amdRes.count,
        intel_families: intelRes.count,
        older_than_cutoff: olderRes.count,
        cutoff_date: cutoff,
      },
      totalDeleted: amdRes.count + intelRes.count + olderRes.count,
    };

    console.log("[cpu-catalog-cleanup] Done:", result);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[cpu-catalog-cleanup] Error:", error?.message || error);
    return new Response(
      JSON.stringify({ success: false, error: String(error?.message || error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
