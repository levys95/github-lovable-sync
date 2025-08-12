
-- Storage policies for bucket "inventory-images"

-- 1) Lecture publique des images du bucket
create policy "Public read for inventory-images"
on storage.objects
for select
using (
  bucket_id = (select id from storage.buckets where name = 'inventory-images')
);

-- 2) Upload par utilisateurs authentifiés
create policy "Authenticated upload to inventory-images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = (select id from storage.buckets where name = 'inventory-images')
);

-- 3) Mise à jour de ses propres fichiers (optionnel mais recommandé)
create policy "Authenticated update own inventory-images"
on storage.objects
for update
to authenticated
using (
  bucket_id = (select id from storage.buckets where name = 'inventory-images')
  and (owner = auth.uid())
)
with check (
  bucket_id = (select id from storage.buckets where name = 'inventory-images')
  and (owner = auth.uid())
);

-- 4) Suppression de ses propres fichiers
create policy "Authenticated delete own inventory-images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = (select id from storage.buckets where name = 'inventory-images')
  and (owner = auth.uid())
);
