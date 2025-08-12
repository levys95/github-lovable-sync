
-- 1) Enums RAM
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ram_generation') then
    create type public.ram_generation as enum ('DDR5','DDR4','DDR3','DDR3L');
  end if;

  if not exists (select 1 from pg_type where typname = 'ram_manufacturer') then
    create type public.ram_manufacturer as enum ('SAMSUNG','HYNIX','MICRON','KINGSTON');
  end if;
end
$$;

-- 2) Table ram_modules
create table if not exists public.ram_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  generation public.ram_generation not null,
  capacity_gb integer not null check (capacity_gb > 0),
  frequency_mhz integer not null check (frequency_mhz > 0),
  manufacturer public.ram_manufacturer not null,
  quantity integer not null default 0 check (quantity >= 0),

  images jsonb not null default '[]'::jsonb, -- URLs publiques (images)
  videos jsonb not null default '[]'::jsonb, -- URLs publiques (vidéos)
  files jsonb not null default '[]'::jsonb,  -- URLs publiques (autres fichiers)
  location text,
  notes text
);

-- Activer RLS
alter table public.ram_modules enable row level security;

-- Politiques RLS (propriétaire uniquement)
create policy "Users can view their own ram modules"
  on public.ram_modules
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ram modules"
  on public.ram_modules
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ram modules"
  on public.ram_modules
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ram modules"
  on public.ram_modules
  for delete
  using (auth.uid() = user_id);

-- Triggers (utilise les fonctions déjà présentes dans le projet)
drop trigger if exists ram_modules_set_user on public.ram_modules;
create trigger ram_modules_set_user
  before insert on public.ram_modules
  for each row execute function public.set_auth_user_id();

drop trigger if exists ram_modules_updated_at on public.ram_modules;
create trigger ram_modules_updated_at
  before update on public.ram_modules
  for each row execute function public.update_updated_at_column();

-- Index utiles
create index if not exists idx_ram_modules_user_id on public.ram_modules(user_id);
create index if not exists idx_ram_modules_generation on public.ram_modules(generation);
create index if not exists idx_ram_modules_manufacturer on public.ram_modules(manufacturer);

-- 3) Bucket de fichiers (public)
insert into storage.buckets (id, name, public)
values ('inventory-files','inventory-files', true)
on conflict (id) do nothing;

-- Politiques de stockage pour le bucket 'inventory-files'
-- Lecture publique
create policy "Public read access to inventory-files"
on storage.objects
for select
using (bucket_id = 'inventory-files');

-- Upload par utilisateurs authentifiés
create policy "Authenticated users can upload to inventory-files"
on storage.objects
for insert
with check (bucket_id = 'inventory-files' and auth.role() = 'authenticated');

-- Mise à jour par le propriétaire
create policy "Users can update their own files in inventory-files"
on storage.objects
for update
using (bucket_id = 'inventory-files' and owner = auth.uid())
with check (bucket_id = 'inventory-files' and owner = auth.uid());

-- Suppression par le propriétaire
create policy "Users can delete their own files in inventory-files"
on storage.objects
for delete
using (bucket_id = 'inventory-files' and owner = auth.uid());
