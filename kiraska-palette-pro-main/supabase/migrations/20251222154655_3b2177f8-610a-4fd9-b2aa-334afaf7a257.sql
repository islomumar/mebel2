-- Drop existing policies on orders table
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can view orders" ON public.orders;

-- Create explicit policies for each operation

-- 1. Public can INSERT orders (needed for customers to place orders)
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);

-- 2. Only admin roles can SELECT/view orders
CREATE POLICY "Admin roles can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- 3. Only admin roles can UPDATE orders (for status changes etc)
CREATE POLICY "Admin roles can update orders"
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

-- 4. Only superadmin can DELETE orders
CREATE POLICY "Superadmin can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));