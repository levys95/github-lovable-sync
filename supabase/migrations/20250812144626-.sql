-- Add triggers to ram_modules to auto-set user_id and update updated_at
-- Safe drop if they already exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_ram_modules_user_id') THEN
    DROP TRIGGER set_ram_modules_user_id ON public.ram_modules;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ram_modules_updated_at') THEN
    DROP TRIGGER update_ram_modules_updated_at ON public.ram_modules;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Create triggers
CREATE TRIGGER set_ram_modules_user_id
BEFORE INSERT ON public.ram_modules
FOR EACH ROW
EXECUTE FUNCTION public.set_auth_user_id();

CREATE TRIGGER update_ram_modules_updated_at
BEFORE UPDATE ON public.ram_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ram_modules_user_id ON public.ram_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_ram_modules_generation ON public.ram_modules(generation);
CREATE INDEX IF NOT EXISTS idx_ram_modules_manufacturer ON public.ram_modules(manufacturer);
