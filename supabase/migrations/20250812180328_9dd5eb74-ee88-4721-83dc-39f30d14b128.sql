
-- 1) Enum des marques CPU
CREATE TYPE public.cpu_brand AS ENUM ('INTEL', 'AMD');

-- 2) Table catalogue CPU (référentiel mondial, consultable par tous)
CREATE TABLE public.cpu_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand public.cpu_brand NOT NULL,
  family TEXT NOT NULL,              -- ex: "Core i5", "Ryzen 5", "Pentium", "Threadripper"
  generation TEXT NOT NULL,          -- ex: "6", "12", "1000", "3000", "Zen 3" (clé text standardisée)
  model TEXT NOT NULL,               -- ex: "6500", "5600X"
  base_clock_ghz NUMERIC,            -- ex: 3.6
  boost_clock_ghz NUMERIC,           -- ex: 4.4
  cores INTEGER,
  threads INTEGER,
  socket TEXT,                       -- ex: "LGA1151", "AM4", "AM5"
  tdp_watts INTEGER,
  release_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cpu_catalog ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire (utile pour remplir les listes côté UI)
CREATE POLICY "cpu_catalog is viewable by everyone"
  ON public.cpu_catalog
  FOR SELECT
  USING (true);

-- Pas de politiques INSERT/UPDATE/DELETE ici: écriture bloquée pour les clients.
-- Les Edge Functions (avec service key) pourront insérer/mettre à jour si besoin (RLS bypass).

-- Trigger pour updated_at
CREATE TRIGGER set_updated_at_on_cpu_catalog
BEFORE UPDATE ON public.cpu_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour accélérer les filtres en cascade
CREATE INDEX idx_cpu_catalog_brand_family ON public.cpu_catalog (brand, family);
CREATE INDEX idx_cpu_catalog_brand_family_generation ON public.cpu_catalog (brand, family, generation);
CREATE UNIQUE INDEX cpu_catalog_unique_model ON public.cpu_catalog (brand, family, generation, model);


-- 3) Table d'inventaire CPU (stock par utilisateur)
CREATE TABLE public.cpu_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  catalog_id UUID REFERENCES public.cpu_catalog(id) ON DELETE SET NULL, -- lien optionnel au catalogue
  brand public.cpu_brand NOT NULL,
  family TEXT NOT NULL,
  generation TEXT NOT NULL,
  model TEXT NOT NULL,
  base_clock_ghz NUMERIC,
  quantity INTEGER NOT NULL DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cpu_inventory ENABLE ROW LEVEL SECURITY;

-- RLS: chaque utilisateur gère son propre stock
CREATE POLICY "Users can view their own cpu inventory"
  ON public.cpu_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cpu inventory"
  ON public.cpu_inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cpu inventory"
  ON public.cpu_inventory
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cpu inventory"
  ON public.cpu_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers: assigner user_id et mettre à jour updated_at
CREATE TRIGGER set_user_id_on_cpu_inventory
BEFORE INSERT ON public.cpu_inventory
FOR EACH ROW
EXECUTE FUNCTION public.set_auth_user_id();

CREATE TRIGGER set_updated_at_on_cpu_inventory
BEFORE UPDATE ON public.cpu_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour requêtes fréquentes
CREATE INDEX idx_cpu_inventory_user ON public.cpu_inventory (user_id);
CREATE INDEX idx_cpu_inventory_user_brand_family_generation
  ON public.cpu_inventory (user_id, brand, family, generation);
