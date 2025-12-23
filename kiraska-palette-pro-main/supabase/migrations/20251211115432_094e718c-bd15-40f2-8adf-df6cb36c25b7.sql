-- Create stock_history table for tracking inventory changes
CREATE TABLE public.stock_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change INTEGER NOT NULL,
    type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage stock history"
ON public.stock_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Anyone can insert stock history via edge function"
ON public.stock_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_stock_history_product_id ON public.stock_history(product_id);
CREATE INDEX idx_stock_history_timestamp ON public.stock_history(timestamp DESC);