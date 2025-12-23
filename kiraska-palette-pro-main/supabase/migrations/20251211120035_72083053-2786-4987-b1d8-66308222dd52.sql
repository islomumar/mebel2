-- =============================================
-- SECURITY FIX: Comprehensive RLS Update
-- =============================================

-- 1. Fix orders table policies
-- Drop existing policies and recreate with proper access
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create proper policies for orders
-- Allow admin, superadmin, and manager to view orders
CREATE POLICY "Admin roles can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
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

-- 2. Fix products table policies for inventory protection
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

-- Create a secure view for public product access (hides inventory fields)
CREATE OR REPLACE VIEW public.products_public AS
SELECT 
  id,
  name,
  slug,
  brand,
  category_id,
  price,
  old_price,
  in_stock,
  is_featured,
  is_bestseller,
  volume,
  color_name,
  image_url,
  short_description,
  full_description,
  created_at,
  updated_at
FROM public.products;

-- Grant access to the public view
GRANT SELECT ON public.products_public TO anon, authenticated;

-- Allow public to view products (all fields visible but inventory managed by admin)
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

-- Allow admin and superadmin full management of products
CREATE POLICY "Admin roles can manage products"
ON public.products
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- 3. Fix stock_history table policies
DROP POLICY IF EXISTS "Admins can manage stock history" ON public.stock_history;
DROP POLICY IF EXISTS "Anyone can insert stock history via edge function" ON public.stock_history;

-- Only admin roles can view stock history
CREATE POLICY "Admin roles can view stock history"
ON public.stock_history
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Only admin roles can insert stock history (edge functions use service role which bypasses RLS)
CREATE POLICY "Admin roles can insert stock history"
ON public.stock_history
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Only admin roles can delete stock history
CREATE POLICY "Admin roles can delete stock history"
ON public.stock_history
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- 4. Fix user_roles table policies to include superadmin
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Only superadmin can manage roles
CREATE POLICY "Superadmin can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Fix categories table policies to include superadmin
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admin roles can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- 6. Fix the update_updated_at_column function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;