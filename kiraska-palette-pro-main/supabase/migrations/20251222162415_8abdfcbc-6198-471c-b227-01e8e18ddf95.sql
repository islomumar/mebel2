-- Enable realtime for warehouse_movements table
ALTER PUBLICATION supabase_realtime ADD TABLE public.warehouse_movements;

-- Enable realtime for products table (for stock updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;