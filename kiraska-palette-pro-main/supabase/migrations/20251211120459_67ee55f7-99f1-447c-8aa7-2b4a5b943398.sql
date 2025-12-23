-- =============================================
-- SECURITY FIX: Restrict Customer Personal Data Access
-- =============================================

-- Drop existing orders policies
DROP POLICY IF EXISTS "Admin roles can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create policy for admin/superadmin to view full order details
CREATE POLICY "Admin and superadmin can view full orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Allow admin and superadmin to update orders
CREATE POLICY "Admin roles can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Allow admin and superadmin to delete orders
CREATE POLICY "Admin roles can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Allow anyone (including unauthenticated) to create orders
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create a limited view for managers (hides personal data)
CREATE OR REPLACE VIEW public.orders_limited
WITH (security_invoker = true) AS
SELECT 
  id,
  status,
  total_amount,
  created_at,
  updated_at
FROM public.orders;

-- Grant access to the limited view
GRANT SELECT ON public.orders_limited TO authenticated;

-- Create RLS policy for orders_limited view access (managers only)
-- Note: Views inherit RLS from underlying tables, so we need a function approach

-- Create a function for managers to get limited order data
CREATE OR REPLACE FUNCTION public.get_orders_for_manager()
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    status,
    total_amount,
    created_at,
    updated_at
  FROM public.orders
  ORDER BY created_at DESC;
$$;

-- Grant execute to authenticated users (will be filtered by role in app)
GRANT EXECUTE ON FUNCTION public.get_orders_for_manager() TO authenticated;