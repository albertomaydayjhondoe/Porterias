# Supabase Storage Setup - Troubleshooting

## Problema: Error al subir archivos (imágenes/videos)

El error ocurre cuando el bucket de storage no está configurado en producción o faltan las políticas RLS.

## Solución rápida

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/sxjwoyxwgmmsaqczvjpd
2. Navega a **SQL Editor**
3. Copia y pega el contenido completo de `scripts/setup-supabase-storage.sql`
4. Ejecuta el script (Run)
5. Verifica la salida:
   - ✅ Bucket 'comic-strips' creado
   - ✅ 4 políticas de storage aplicadas
   - ✅ Usuario admin encontrado
   - ✅ Rol admin asignado

## Verificación manual

### 1. Verificar bucket existe
```sql
SELECT * FROM storage.buckets WHERE id = 'comic-strips';
```
**Esperado:** 1 fila con `id='comic-strips', public=true`

### 2. Verificar políticas de storage
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```
**Esperado:** 4 políticas
- Anyone can view comic strips
- Admins can upload comic strips
- Admins can update comic strips
- Admins can delete comic strips

### 3. Verificar usuario admin
```sql
SELECT id, email FROM auth.users WHERE email = 'sampayo@gmail.com';
```
**Esperado:** 1 fila con UUID `ba4dbfbd-f3cb-4492-9af6-9d263fb29ec9`

### 4. Verificar asignación de rol
```sql
SELECT * FROM public.user_roles WHERE role = 'admin';
```
**Esperado:** 1 fila con `user_id` del admin

## Debugging adicional

Si después de ejecutar el setup sigue fallando:

### A) Verificar función has_role existe
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'has_role';
```

### B) Probar función manualmente
```sql
SELECT public.has_role('ba4dbfbd-f3cb-4492-9af6-9d263fb29ec9'::uuid, 'admin');
```
**Esperado:** `true`

### C) Ver error específico en Admin panel
1. Abre Developer Tools (F12) en el navegador
2. Ve a la pestaña Console
3. Intenta subir un archivo
4. Copia el mensaje de error completo

## Errores comunes

### "new row violates row-level security policy"
**Causa:** Usuario no tiene rol de admin asignado
**Solución:** Ejecutar en SQL Editor:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('ba4dbfbd-f3cb-4492-9af6-9d263fb29ec9'::uuid, 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### "permission denied for table buckets"
**Causa:** Bucket no creado o no público
**Solución:** Ejecutar `scripts/setup-supabase-storage.sql` completo

### "function public.has_role does not exist"
**Causa:** Migraciones no aplicadas
**Solución:** Ejecutar desde SQL Editor:
```sql
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
```

### "Error uploading file: rate limit exceeded"
**Causa:** Storage API rate limit alcanzado
**Solución:** Esperar 1 minuto y reintentar

## Configuración de MIME types permitidos

El bucket acepta:
- **Imágenes:** JPG, PNG, GIF, WebP (max 50MB)
- **Videos:** MP4, WebM, OGG (max 50MB)

Si necesitas otros formatos, actualiza:
```typescript
// src/lib/security.ts
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/ogg',
  'video/quicktime', // Para MOV
];
```

## Testing después del setup

1. Login en admin: https://albertomaydayjhondoe.github.io/Porterias/admin
   - Email: `sampayo@gmail.com`
   - Pass: `Bac2317?`

2. Intenta subir una imagen de prueba
3. Verifica que aparece en https://albertomaydayjhondoe.github.io/Porterias/

4. Verifica en Supabase Storage:
   - Dashboard → Storage → comic-strips
   - Deberías ver el archivo subido

## Contacto de emergencia

Si nada funciona, comparte:
1. Captura del error en Console (F12)
2. Resultado de ejecutar `scripts/check-supabase-setup.sql`
3. URL del proyecto Supabase
