-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('ready', 'waiting-sorting', 'unknown')),
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  brand TEXT,
  model TEXT,
  big_bag_weight DECIMAL(10,2) DEFAULT 0,
  pallet_weight DECIMAL(10,2) DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  shipment_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations for now (can be restricted later with authentication)
CREATE POLICY "Allow all operations on inventory_items"
ON public.inventory_items
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.inventory_items (
  name, category, condition, quantity, location, date_added, brand, model, 
  description, big_bag_weight, pallet_weight, shipment_number
) VALUES 
(
  'iPhone 12', 'Smartphones', 'ready', 15.5, 'A-1', '2024-01-15', 'Apple', 'iPhone 12',
  'Smartphones fonctionnels prêts pour la remise à neuf', 1.2, 0.8, 'EXP-2024-001'
),
(
  'Écran Samsung Galaxy', 'Gsm a touches', 'waiting-sorting', 8.3, 'B-2', '2024-01-20', 'Samsung', NULL,
  'Écrans tactiles pour appareils mobiles', 0.5, 0, 'EXP-2024-002'
),
(
  'Pièces de téléphone génériques', 'China Phone', 'unknown', 12.1, 'C-1', '2024-01-18', NULL, NULL,
  'Divers composants de téléphones chinois', 0, 0, 'EXP-2024-003'
);