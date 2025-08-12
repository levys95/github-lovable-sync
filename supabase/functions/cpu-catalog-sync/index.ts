
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Row = {
  brand: "INTEL" | "AMD";
  family: string;        // ex: "Core i5" ou "Ryzen 7"
  generation: string;    // ex: "4" (Intel), "5000" (AMD)
  model: string;         // ex: "i5-4670K" ou "Ryzen 5 5600X"
  base_clock_ghz: number | null;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fetchText(url: string): Promise<string> {
  console.log("[cpu-catalog-sync] Fetch:", url);
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (cpu-catalog-sync bot)",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

// Parse Intel models from arbitrary wiki HTML/text
function extractIntel(content: string): Row[] {
  // Match common Intel Core models, e.g. i5-4670K, i7-8700, i9-13900K, i3-10100F, etc.
  const intelRegex = /\bi([3579])-(\d{4,5})([A-Z]{0,3}\+?)\b/g;
  const seen = new Set<string>();
  const rows: Row[] = [];

  let m: RegExpExecArray | null;
  while ((m = intelRegex.exec(content)) !== null) {
    const series = m[1];              // 3/5/7/9
    const digits = m[2];              // 4 or 5 digits
    const suffix = m[3] || "";        // optional suffix like K, KF, F, T, X, etc
    const model = `i${series}-${digits}${suffix}`;

    // Determine generation number:
    let genNum = 0;
    if (digits.length === 5) {
      // 10th+ gen (e.g., 10400 -> 10, 12400 -> 12, 14900 -> 14)
      genNum = parseInt(digits.slice(0, 2), 10);
    } else {
      // 4-digit (e.g., 4670 -> 4, 8700 -> 8, 9600 -> 9)
      genNum = parseInt(digits[0], 10);
    }

    if (!Number.isFinite(genNum) || genNum < 4) continue; // Only from 4th gen+

    const family = `Core i${series}`;
    const brand: Row["brand"] = "INTEL";
    const generation = String(genNum); // store as "4", "5", ..., "14"

    const key = `${brand}|${family}|${generation}|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      brand,
      family,
      generation,
      model,
      base_clock_ghz: null,
    });
  }

  return rows;
}

// Parse AMD Ryzen models from wiki HTML/text
function extractAMD(content: string): Row[] {
  // Examples: "Ryzen 5 3600", "Ryzen 7 5800X3D", "Ryzen 9 7950X"
  // Also handle "Ryzen 7 PRO 4750G"
  const amdRegex = /\bRyzen\s+(3|5|7|9)\s+(?:PRO\s+)?(\d{4,5})([A-Z0-9]{0,3})\b/gi;
  const seen = new Set<string>();
  const rows: Row[] = [];

  let m: RegExpExecArray | null;
  while ((m = amdRegex.exec(content)) !== null) {
    const tier = m[1];                // 3/5/7/9
    const digits = m[2];              // 4 or 5 digits (APUs sometimes 5)
    const suffix = (m[3] || "").toUpperCase();
    const model = `Ryzen ${tier} ${digits}${suffix}`;

    // Deduce generation series (1000, 2000, 3000, 4000, 5000, 7000, 8000, 9000)
    // Use first digit of 4-digit number; if 5 digits, take first digit still
    const firstDigit = parseInt(digits[0], 10);
    if (!Number.isFinite(firstDigit) || firstDigit < 1) continue;

    const series = firstDigit * 1000;
    if (series < 1000) continue; // start at 1000

    const brand: Row["brand"] = "AMD";
    const family = `Ryzen ${tier}`;
    const generation = String(series);

    const key = `${brand}|${family}|${generation}|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      brand,
      family,
      generation,
      model,
      base_clock_ghz: null,
    });
  }

  return rows;
}

function uniqueByKey(rows: Row[]): Row[] {
  const seen = new Set<string>();
  const out: Row[] = [];
  for (const r of rows) {
    const key = `${r.brand}|${r.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function getExistingModelsByBrand(brand: Row["brand"]): Promise<Set<string>> {
  const existing = new Set<string>();
  // Pull only brand+model (reduce payload)
  const { data, error } = await supabase
    .from("cpu_catalog")
    .select("brand,model")
    .eq("brand", brand)
    .limit(200000);

  if (error) {
    console.error("Error reading existing cpu_catalog:", error);
    throw error;
  }

  for (const row of data ?? []) {
    existing.add(`${row.brand}|${row.model}`);
  }
  return existing;
}

async function insertRowsSafe(rows: Row[]): Promise<number> {
  let inserted = 0;
  const chunks = chunk(rows, 500);
  for (const c of chunks) {
    const { error, count } = await supabase
      .from("cpu_catalog")
      .insert(c, { count: "exact" });
    if (error) {
      console.error("Insert chunk error:", error, "Chunk size:", c.length);
      // Try continue with next chunk to insert as much as possible
      continue;
    }
    if (typeof count === "number") {
      inserted += count;
    } else {
      inserted += c.length;
    }
  }
  return inserted;
}

async function runSync(scope: "intel" | "amd" | "all") {
  const intelSources = [
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i3_microprocessors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i5_microprocessors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i7_microprocessors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i9_microprocessors",
  ];
  const amdSources = [
    "https://en.wikipedia.org/wiki/List_of_AMD_Ryzen_microprocessors",
  ];

  let intelRows: Row[] = [];
  let amdRows: Row[] = [];

  if (scope === "intel" || scope === "all") {
    for (const url of intelSources) {
      try {
        const html = await fetchText(url);
        intelRows.push(...extractIntel(html));
      } catch (e) {
        console.error("[intel] Source failed:", url, e);
      }
    }
    intelRows = uniqueByKey(intelRows);
  }

  if (scope === "amd" || scope === "all") {
    for (const url of amdSources) {
      try {
        const html = await fetchText(url);
        amdRows.push(...extractAMD(html));
      } catch (e) {
        console.error("[amd] Source failed:", url, e);
      }
    }
    amdRows = uniqueByKey(amdRows);
  }

  // Filter by generation thresholds
  intelRows = intelRows.filter(r => Number(r.generation) >= 4);
  // AMD starts at 1000 series
  amdRows = amdRows.filter(r => Number(r.generation) >= 1000);

  // De-duplicate against DB
  let toInsert: Row[] = [];
  if (intelRows.length) {
    const existingIntel = await getExistingModelsByBrand("INTEL");
    const freshIntel = intelRows.filter(r => !existingIntel.has(`${r.brand}|${r.model}`));
    toInsert.push(...freshIntel);
  }
  if (amdRows.length) {
    const existingAmd = await getExistingModelsByBrand("AMD");
    const freshAmd = amdRows.filter(r => !existingAmd.has(`${r.brand}|${r.model}`));
    toInsert.push(...freshAmd);
  }

  const totalFound = intelRows.length + amdRows.length;
  const toInsertCount = toInsert.length;

  let inserted = 0;
  if (toInsertCount > 0) {
    inserted = await insertRowsSafe(toInsert);
  }

  return {
    scope,
    found: totalFound,
    prepared: toInsertCount,
    inserted,
    sample: toInsert.slice(0, 10).map(r => `${r.brand} • ${r.family} • Gen ${r.generation} • ${r.model}`),
  };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scope } = await req.json().catch(() => ({ scope: "all" }));
    const s = (scope === "intel" || scope === "amd" || scope === "all") ? scope : "all";
    console.log("[cpu-catalog-sync] Start with scope:", s);
    const result = await runSync(s);
    console.log("[cpu-catalog-sync] Done:", result);
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[cpu-catalog-sync] Error:", error?.message || error);
    return new Response(JSON.stringify({ success: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
