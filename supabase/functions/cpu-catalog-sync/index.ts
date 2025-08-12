
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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Exclude families from being imported again
const EXCLUDED_FAMILIES = new Set<string>([
  "Athlon",
  "Athlon X2",
  "Athlon X4",
  "Atom",
  "Celeron",
  "Pentium",
  "Pentium Gold",
  "Pentium Silver",
]);

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

// Additional Intel extractors: Core Ultra, Pentium/Celeron/Atom/Xeon
function extractIntelCoreUltra(content: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  // e.g., "Core Ultra 7 155H", "Core Ultra 5 125U", "Core Ultra 9 185H"
  const re = /\bCore\s+Ultra\s+(5|7|9)\s+(\d{3})([A-Z]{0,3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const tier = m[1];
    const digits = m[2];
    const suffix = (m[3] || "").toUpperCase();
    const model = `Core Ultra ${tier} ${digits}${suffix}`;
    const brand: Row["brand"] = "INTEL";
    const family = `Core Ultra ${tier}`;
    // Use first digit as "series" for Ultra
    const generation = digits ? String(parseInt(digits[0], 10)) : "Ultra";
    const key = `${brand}|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand, family, generation, model, base_clock_ghz: null });
  }
  return rows;
}

// Xeon Scalable (Silver, Bronze, Gold, Max)
function xeonScalableGenFromDigits(digits: string): number {
  const prefix = parseInt(digits.slice(0, 2), 10);
  if ([31,41,51,61].includes(prefix)) return 1;
  if ([32,42,52,62].includes(prefix)) return 2;
  if ([43,53,63].includes(prefix)) return 3;
  if ([64,94].includes(prefix)) return 4;
  if ([65,95].includes(prefix)) return 5;
  return 1;
}

function extractIntelXeonScalable(content: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  // Xeon Silver / Bronze / Gold
  const reSbg = /\bXeon\s+(Silver|Bronze|Gold)\s+(\d{4,5})([A-Z0-9]{0,2})\b/gi;
  while ((m = reSbg.exec(content)) !== null) {
    const tier = m[1];
    const digits = m[2];
    const suff = (m[3] || "").toUpperCase();
    const model = `Xeon ${tier} ${digits}${suff}`;
    const brand: Row["brand"] = "INTEL";
    const family = `Xeon ${tier}`;
    const generation = `Scalable ${xeonScalableGenFromDigits(digits)}`;
    const key = `${brand}|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand, family, generation, model, base_clock_ghz: null });
  }

  // Xeon Max
  const reMax = /\bXeon(?:\s+CPU)?\s+Max\s+(\d{4,5})([A-Z0-9]{0,2})\b/gi;
  while ((m = reMax.exec(content)) !== null) {
    const digits = m[1];
    const suff = (m[2] || "").toUpperCase();
    const model = `Xeon Max ${digits}${suff}`;
    const brand: Row["brand"] = "INTEL";
    const family = "Xeon Max";
    const generation = `Scalable ${xeonScalableGenFromDigits(digits)}`;
    const key = `${brand}|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand, family, generation, model, base_clock_ghz: null });
  }

  return rows;
}

function extractIntelOther(content: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();

  // Pentium (incl. Gold/Silver) e.g., "Pentium G4560", "Pentium Gold G6400"
  const pentiumRe = /\bPentium(?:\s+(Gold|Silver))?\s+([A-Z]?\d{3,5})([A-Z0-9]{0,3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = pentiumRe.exec(content)) !== null) {
    const flavor = m[1] ? `Pentium ${m[1]}` : "Pentium";
    const code = m[2].toUpperCase();
    const suff = (m[3] || "").toUpperCase();
    const model = `${flavor} ${code}${suff}`;
    const generation = /\d/.test(code) ? String(parseInt(code.replace(/\D/g, "")[0] || "0", 10) * 1000 || "0") : "0";
    const key = `INTEL|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand: "INTEL", family: flavor, generation, model, base_clock_ghz: null });
  }

  // Celeron e.g., "Celeron G5905", "Celeron N4020"
  const celeronRe = /\bCeleron\s+([A-Z]?\d{3,5})([A-Z0-9]{0,3})\b/gi;
  while ((m = celeronRe.exec(content)) !== null) {
    const code = m[1].toUpperCase();
    const suff = (m[2] || "").toUpperCase();
    const model = `Celeron ${code}${suff}`;
    const generation = /\d/.test(code) ? String(parseInt(code.replace(/\D/g, "")[0] || "0", 10) * 1000 || "0") : "0";
    const key = `INTEL|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand: "INTEL", family: "Celeron", generation, model, base_clock_ghz: null });
  }

  // Atom e.g., "Atom x5-Z8350", "Atom N280"
  const atomRe = /\bAtom\s+([a-z]\d-)?([A-Z]?\d{3,4})([A-Z0-9]{0,3})\b/gi;
  while ((m = atomRe.exec(content)) !== null) {
    const codePrefix = m[1] ? m[1].toUpperCase() : "";
    const code = m[2].toUpperCase();
    const suff = (m[3] || "").toUpperCase();
    const model = `Atom ${codePrefix}${code}${suff}`.trim();
    const generation = /\d/.test(code) ? String(parseInt(code.replace(/\D/g, "")[0] || "0", 10) * 1000 || "0") : "0";
    const key = `INTEL|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand: "INTEL", family: "Atom", generation, model, base_clock_ghz: null });
  }

  // Skipped Xeon generic families here; handled by extractIntelXeonScalable


  return rows;
}

// AMD additional extractors: Threadripper, EPYC, Athlon
function extractAMDThreadripper(content: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  const re = /\bRyzen\s+Threadripper\s+(\d{4,5})([A-Z0-9]{0,3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const digits = m[1];
    const suff = (m[2] || "").toUpperCase();
    const model = `Ryzen Threadripper ${digits}${suff}`;
    const generation = String(parseInt(digits[0], 10) * 1000 || 1000);
    const key = `AMD|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand: "AMD", family: "Ryzen Threadripper", generation, model, base_clock_ghz: null });
  }
  return rows;
}

function extractAMDEpyc(content: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  const re = /\bEPYC\s+(\d{4,5})([A-Z0-9]{0,3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const digits = m[1];
    const suff = (m[2] || "").toUpperCase();
    const model = `EPYC ${digits}${suff}`;
    const generation = String(parseInt(digits[0], 10) * 1000 || 1000);
    const key = `AMD|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand: "AMD", family: "EPYC", generation, model, base_clock_ghz: null });
  }
  return rows;
}

function extractAMDAthlon(content: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  // e.g., "Athlon 3000G", "Athlon X4 860K"
  const re = /\bAthlon(?:\s+(X2|X3|X4))?\s+(\d{3,4})([A-Z0-9]{0,3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const series = m[1] ? `Athlon ${m[1]}` : "Athlon";
    const digits = m[2];
    const suff = (m[3] || "").toUpperCase();
    const model = `${series} ${digits}${suff}`;
    const generation = digits.length >= 4 ? String(parseInt(digits[0], 10) * 1000) : digits;
    const key = `AMD|${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ brand: "AMD", family: series, generation, model, base_clock_ghz: null });
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
  const { data, error } = await getClient()
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
    const { error, count } = await getClient()
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
    // Core i-series
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i3_microprocessors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i5_microprocessors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i7_microprocessors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Core_i9_microprocessors",
    // Core Ultra series (Meteor/Arrow Lake pages often contain model lists)
    "https://en.wikipedia.org/wiki/Intel_Core_(14th_generation)",
    "https://en.wikipedia.org/wiki/Meteor_Lake",
    // Legacy/value lines
    "https://en.wikipedia.org/wiki/List_of_Intel_Pentium_processors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Celeron_processors",
    "https://en.wikipedia.org/wiki/List_of_Intel_Atom_microprocessors",
    // Xeon lines
    "https://en.wikipedia.org/wiki/List_of_Intel_Xeon_processors",
  ];
  const amdSources = [
    "https://en.wikipedia.org/wiki/List_of_AMD_Ryzen_microprocessors",
    "https://en.wikipedia.org/wiki/AMD_Ryzen_Threadripper",
    "https://en.wikipedia.org/wiki/AMD_Epyc",
    "https://en.wikipedia.org/wiki/List_of_AMD_Athlon_microprocessors",
  ];

  let intelRows: Row[] = [];
  let amdRows: Row[] = [];

  if (scope === "intel" || scope === "all") {
    for (const url of intelSources) {
      try {
        const html = await fetchText(url);
        intelRows.push(
          ...extractIntel(html),
          ...extractIntelCoreUltra(html),
          ...extractIntelXeonScalable(html),
          ...extractIntelOther(html),
        );
      } catch (e) {
        console.error("[intel] Source failed:", url, e);
      }
    }
    intelRows = uniqueByKey(intelRows);
    intelRows = intelRows.filter(r => !EXCLUDED_FAMILIES.has(r.family));
  }

  if (scope === "amd" || scope === "all") {
    for (const url of amdSources) {
      try {
        const html = await fetchText(url);
        amdRows.push(
          ...extractAMD(html),
          ...extractAMDThreadripper(html),
          ...extractAMDEpyc(html),
          ...extractAMDAthlon(html),
        );
      } catch (e) {
        console.error("[amd] Source failed:", url, e);
      }
    }
    amdRows = uniqueByKey(amdRows);
    amdRows = amdRows.filter(r => !EXCLUDED_FAMILIES.has(r.family));
  }

  // Keep everything; generations are best-effort and may be non-numeric for some families

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
    foundIntel: intelRows.length,
    foundAmd: amdRows.length,
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
