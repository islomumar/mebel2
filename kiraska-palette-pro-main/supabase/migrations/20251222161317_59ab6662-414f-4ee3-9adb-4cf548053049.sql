-- Create warehouse_movements table for tracking stock changes
CREATE TABLE public.warehouse_movements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    shop_id UUID NULL,
    created_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warehouse_movements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin roles can view warehouse movements"
ON public.warehouse_movements
FOR SELECT
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admin roles can insert warehouse movements"
ON public.warehouse_movements
FOR INSERT
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Superadmin can delete warehouse movements"
ON public.warehouse_movements
FOR DELETE
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_warehouse_movements_product_id ON public.warehouse_movements(product_id);
CREATE INDEX idx_warehouse_movements_created_at ON public.warehouse_movements(created_at);
CREATE INDEX idx_warehouse_movements_type ON public.warehouse_movements(type);