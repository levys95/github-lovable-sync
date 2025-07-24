-- Create storage bucket for inventory item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inventory-images', 'inventory-images', true);

-- Create storage policies for inventory images
CREATE POLICY "Anyone can view inventory images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'inventory-images');

CREATE POLICY "Anyone can upload inventory images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'inventory-images');

CREATE POLICY "Anyone can update inventory images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'inventory-images');

CREATE POLICY "Anyone can delete inventory images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'inventory-images');