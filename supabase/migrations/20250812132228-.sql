-- Add triggers for user_id and updated_at if missing, and seed default categories

-- 1) Triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_categories_user_id') THEN
    CREATE TRIGGER set_categories_user_id
    BEFORE INSERT ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.set_auth_user_id();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_inventory_items_user_id') THEN
    CREATE TRIGGER set_inventory_items_user_id
    BEFORE INSERT ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.set_auth_user_id();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_items_updated_at') THEN
    CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Seed default categories (French labels)
WITH v(name) AS (
  VALUES
    ('Smartphones'),
    ('Gsm a touches'),
    ('China Phone'),
    ('Téléphones'),
    ('Ordinateurs'),
    ('Téléviseurs'),
    ('Autres électroniques'),
    ('15 au'),
    ('30 au'),
    ('50 au'),
    ('100 au'),
    ('150 au'),
    ('200 au'),
    ('250 au'),
    ('300 au'),
    ('350 au'),
    ('400 au'),
    ('800 au'),
    ('1000 +')
)
INSERT INTO public.categories(name, description, user_id)
SELECT v.name, NULL, gen_random_uuid()
FROM v
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.name = v.name
);
