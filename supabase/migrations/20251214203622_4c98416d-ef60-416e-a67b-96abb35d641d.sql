-- Add video_url column for video content
ALTER TABLE public.comic_strips 
ADD COLUMN IF NOT EXISTS video_url text;

-- Add media_type column to distinguish between images and videos
ALTER TABLE public.comic_strips 
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image' 
CHECK (media_type IN ('image', 'video'));

-- Make image_url nullable since videos won't have it
ALTER TABLE public.comic_strips 
ALTER COLUMN image_url DROP NOT NULL;

-- Add constraint to ensure at least one URL is provided
ALTER TABLE public.comic_strips 
ADD CONSTRAINT check_media_url 
CHECK (image_url IS NOT NULL OR video_url IS NOT NULL);

-- Create index for quick filtering by media type
CREATE INDEX IF NOT EXISTS idx_comic_strips_media_type ON public.comic_strips(media_type);