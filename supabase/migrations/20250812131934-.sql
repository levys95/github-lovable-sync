-- Make categories publicly readable so they appear without auth
-- Keep INSERT/UPDATE/DELETE restricted to the owner

-- Ensure RLS is enabled (already is according to schema)

-- Replace restrictive SELECT policy with a permissive one
DROP POLICY IF EXISTS "Categories are viewable by owner" ON public.categories;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (true);
