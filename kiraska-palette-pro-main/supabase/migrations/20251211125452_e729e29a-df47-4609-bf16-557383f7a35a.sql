-- Drop existing restrictive policies and create proper permissive ones
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin and superadmin can view full orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can delete orders" ON public.orders;

-- Create permissive policy for INSERT (anyone can create orders)
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);

-- Create permissive policy for SELECT (only admin/superadmin)
CREATE POLICY "Admin and superadmin can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Create permissive policy for UPDATE (only admin/superadmin)
CREATE POLICY "Admin and superadmin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Create permissive policy for DELETE (only admin/superadmin)
CREATE POLICY "Admin and superadmin can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Secure the get_orders_for_manager function to only work for authorized roles
CREATE OR REPLACE FUNCTION public.get_orders_for_manager()
RETURNS TABLE(
  id uuid,
  status text,
  total_amount numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    o.id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at
  FROM public.orders o
  WHERE 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'superadmin'::app_role)
  ORDER BY o.created_at DESC;
$$;

-- Drop and recreate orders_limited view with proper security
DROP VIEW IF EXISTS public.orders_limited;

CREATE VIEW public.orders_limited AS
SELECT 
  id,
  status,
  total_amount,
  created_at,
  updated_at
FROM public.orders;

-- Enable RLS on the view
ALTER VIEW public.orders_limited SET (security_invoker = true);

-- Revoke all access and grant only to specific roles
REVOKE ALL ON public.orders_limited FROM public;
REVOKE ALL ON public.orders_limited FROM anon;
GRANT SELECT ON public.orders_limited TO authenticated;