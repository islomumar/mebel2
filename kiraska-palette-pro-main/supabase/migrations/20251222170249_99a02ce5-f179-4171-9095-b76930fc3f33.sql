
-- Drop existing SELECT policy and recreate as RESTRICTIVE
DROP POLICY IF EXISTS "Admin roles can view orders" ON public.orders;

-- Create RESTRICTIVE SELECT policy - only admin roles can view orders
CREATE POLICY "Admin roles can view orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Also make UPDATE policy explicit for authenticated only
DROP POLICY IF EXISTS "Admin roles can update orders" ON public.orders;

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

-- Make DELETE policy explicit for authenticated only  
DROP POLICY IF EXISTS "Superadmin can delete orders" ON public.orders;

CREATE POLICY "Superadmin can delete orders" 
ON public.orders 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));
