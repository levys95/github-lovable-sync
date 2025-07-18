-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert all categories
INSERT INTO public.categories (name, description) VALUES
('Smartphones', 'Téléphones intelligents'),
('Gsm a touches', 'Téléphones à touches'),
('China Phone', 'Téléphones chinois'),
('power supply full', 'Alimentations complètes'),
('hdd full', 'Disques durs complets'),
('15 au', 'Composants 15 au'),
('30 au', 'Composants 30 au'),
('50 au', 'Composants 50 au'),
('100 au', 'Composants 100 au'),
('150 au', 'Composants 150 au'),
('200 au', 'Composants 200 au'),
('250 au', 'Composants 250 au'),
('300 au', 'Composants 300 au'),
('350 au', 'Composants 350 au'),
('400 au', 'Composants 400 au'),
('800 au', 'Composants 800 au'),
('1000 +', 'Composants 1000+ au'),
('full cdrom', 'Lecteurs CD-ROM complets');

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy for reading categories (everyone can read)
CREATE POLICY "Anyone can read categories"
ON public.categories
FOR SELECT
USING (true);