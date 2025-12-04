-- Drop existing permissive write policies
DROP POLICY IF EXISTS "Public can insert strips" ON comic_strips;
DROP POLICY IF EXISTS "Public can update strips" ON comic_strips;
DROP POLICY IF EXISTS "Public can delete strips" ON comic_strips;

-- Create admin-only write policies
CREATE POLICY "Only admins can insert strips"
ON comic_strips FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update strips"
ON comic_strips FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete strips"
ON comic_strips FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));