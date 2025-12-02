-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can insert strips" ON public.comic_strips;
DROP POLICY IF EXISTS "Only admins can update strips" ON public.comic_strips;
DROP POLICY IF EXISTS "Only admins can delete strips" ON public.comic_strips;

-- Create public policies for comic_strips (admin access will be controlled by simple password in UI)
CREATE POLICY "Public can insert strips" 
ON public.comic_strips 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update strips" 
ON public.comic_strips 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete strips" 
ON public.comic_strips 
FOR DELETE 
USING (true);

-- Update storage policy to allow public uploads
DROP POLICY IF EXISTS "Admins can upload strips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update strips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete strips" ON storage.objects;

CREATE POLICY "Public can upload strips"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'comic-strips');

CREATE POLICY "Public can update strips"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'comic-strips');

CREATE POLICY "Public can delete strips"
ON storage.objects
FOR DELETE
USING (bucket_id = 'comic-strips');