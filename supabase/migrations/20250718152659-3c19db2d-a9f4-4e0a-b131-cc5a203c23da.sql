-- Remove model column from inventory_items table as it's not needed
ALTER TABLE inventory_items DROP COLUMN model;