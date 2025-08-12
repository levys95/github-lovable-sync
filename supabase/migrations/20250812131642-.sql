-- Enable required extensions
create extension if not exists pgcrypto;

-- Shared function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Function to set user_id from auth.uid() on insert when missing
create or replace function public.set_auth_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql;

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.categories enable row level security;

-- Inventory items table
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  category text not null,
  condition text not null default 'unknown',
  quantity numeric(12,3) not null default 0,
  location text not null,
  date_added timestamptz not null default now(),
  description text,
  brand text,
  big_bag_weight numeric(12,3),
  pallet_weight numeric(12,3),
  images jsonb not null default '[]'::jsonb,
  shipment_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_items enable row level security;

-- Triggers for timestamps and user_id population
create trigger categories_set_user_id
before insert on public.categories
for each row execute function public.set_auth_user_id();

create trigger categories_update_timestamp
before update on public.categories
for each row execute function public.update_updated_at_column();

create trigger inventory_set_user_id
before insert on public.inventory_items
for each row execute function public.set_auth_user_id();

create trigger inventory_update_timestamp
before update on public.inventory_items
for each row execute function public.update_updated_at_column();

-- RLS policies for categories
create policy "Categories are viewable by owner"
  on public.categories for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS policies for inventory_items
create policy "Inventory items are viewable by owner"
  on public.inventory_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own inventory items"
  on public.inventory_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own inventory items"
  on public.inventory_items for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own inventory items"
  on public.inventory_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- Realtime support for inventory_items
alter table public.inventory_items replica identity full;
alter publication supabase_realtime add table public.inventory_items;

-- Storage bucket for inventory images
insert into storage.buckets (id, name, public)
values ('inventory-images', 'inventory-images', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Inventory images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'inventory-images');

create policy "Authenticated users can upload inventory images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'inventory-images');

create policy "Authenticated users can update inventory images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'inventory-images');

create policy "Authenticated users can delete inventory images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'inventory-images');