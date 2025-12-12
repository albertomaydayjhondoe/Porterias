-- ============================================
-- SUPABASE SETUP SCRIPT FOR PORTERIAS
-- Execute this in Supabase SQL Editor
-- ============================================

-- 1. Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('comic-strips', 'comic-strips', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies to recreate them
DROP POLICY IF EXISTS "Anyone can view comic strips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload comic strips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update comic strips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete comic strips" ON storage.objects;

-- 3. Create has_role function if not exists
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = $2
  );
END;
$$;

-- 4. Create storage policies
CREATE POLICY "Anyone can view comic strips"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'comic-strips');

CREATE POLICY "Admins can upload comic strips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'comic-strips' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update comic strips"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'comic-strips' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete comic strips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'comic-strips' AND
    public.has_role(auth.uid(), 'admin')
  );

-- 5. Verify admin user exists (check output)
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'sampayo@gmail.com';

-- 6. Verify role assignment (check output)
SELECT ur.user_id, ur.role, u.email
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- ============================================
-- EXPECTED OUTPUT:
-- - Bucket 'comic-strips' exists
-- - 4 storage policies created
-- - Admin user sampayo@gmail.com found
-- - Admin role assigned to user
-- ============================================
