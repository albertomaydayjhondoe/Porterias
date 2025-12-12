-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'comic-strips';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check comic_strips table
SELECT * FROM information_schema.tables WHERE table_name = 'comic_strips';

-- Check user_roles table
SELECT * FROM information_schema.tables WHERE table_name = 'user_roles';

-- Check has_role function
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'has_role';

-- Check admin user
SELECT id, email FROM auth.users WHERE email = 'sampayo@gmail.com';

-- Check admin role assignment
SELECT * FROM public.user_roles;
