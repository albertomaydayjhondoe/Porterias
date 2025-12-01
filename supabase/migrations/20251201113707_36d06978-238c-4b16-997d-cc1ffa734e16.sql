-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create comic_strips table
CREATE TABLE public.comic_strips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (publish_date)
);

ALTER TABLE public.comic_strips ENABLE ROW LEVEL SECURITY;

-- Comic strips policies
CREATE POLICY "Anyone can view published strips"
  ON public.comic_strips FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert strips"
  ON public.comic_strips FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update strips"
  ON public.comic_strips FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete strips"
  ON public.comic_strips FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for comic strips
INSERT INTO storage.buckets (id, name, public)
VALUES ('comic-strips', 'comic-strips', true);

-- Storage policies for comic strips
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

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial admin user role
-- Note: You'll need to create the admin user first, then manually add their ID here
-- For now, this is just a placeholder comment for setup instructions