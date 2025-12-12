# 🔐 Configuración del GitHub Token para Admin Panel

## ¿Por qué necesitas esto?

El admin panel ahora sube archivos directamente al repositorio de GitHub usando la API. Esto permite:
- ✅ Storage local en el repositorio (no depende de Supabase Storage)
- ✅ Archivos versionados con Git
- ✅ Deploy automático en GitHub Pages
- ✅ Sin costos adicionales de almacenamiento

## Paso 1: Crear Personal Access Token

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre descriptivo: `Porterias Admin Upload`
4. Selecciona la expiración: **No expiration** (o elige un periodo)
5. Marca el scope: **`repo`** (Full control of private repositories)
   - Esto incluye todos los sub-scopes necesarios
6. Scroll down y click **"Generate token"**
7. **⚠️ COPIA EL TOKEN INMEDIATAMENTE** - no podrás verlo de nuevo

## Paso 2: Configurar en el proyecto

### Opción A: Desarrollo local

1. Crea el archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

2. Edita `.env` y pega tu token:
```env
VITE_GITHUB_TOKEN=ghp_tu_token_aqui_1234567890abcdef
```

3. ⚠️ **NUNCA** hagas commit de `.env` (ya está en `.gitignore`)

### Opción B: Producción (GitHub Pages)

El token NO debe estar en el código de producción. Hay dos opciones:

**Opción 1 - Usar desde desarrollo:**
- Solo sube archivos desde tu entorno de desarrollo local
- Los cambios se despliegan automáticamente al hacer push

**Opción 2 - GitHub Actions + Secrets (recomendado para equipos):**
1. Ve a: https://github.com/albertomaydayjhondoe/Porterias/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `VITE_GITHUB_TOKEN`
4. Value: Tu token
5. Modifica `.github/workflows/deploy.yml` para inyectar el secret

## Paso 3: Probar

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve a `/admin` y haz login

3. Intenta subir una imagen o video

4. Verifica en GitHub que:
   - Se creó el archivo en `src/assets/strips/`
   - Se actualizó `public/data/strips.json`
   - El commit aparece en el historial

## Troubleshooting

### "GitHub token not configured"
- Verifica que `.env` existe y tiene `VITE_GITHUB_TOKEN`
- Reinicia el servidor de desarrollo (`npm run dev`)

### "Failed to upload: 401 Unauthorized"
- El token ha expirado o es inválido
- Genera un nuevo token
- Verifica que seleccionaste el scope `repo`

### "Failed to upload: 404 Not Found"
- El repositorio o archivo no existe
- Verifica los valores en `src/lib/github.ts`:
  ```typescript
  const GITHUB_OWNER = 'albertomaydayjhondoe';
  const GITHUB_REPO = 'Porterias';
  ```

### "Failed to fetch strips.json"
- El archivo no existe en el repositorio
- Verifica que `public/data/strips.json` existe

### El archivo se sube pero no aparece en la página
- GitHub Pages tarda 1-2 minutos en re-desplegar
- Verifica que el commit se hizo correctamente en GitHub
- Limpia el cache del navegador (Ctrl+Shift+R)

## Seguridad

### ✅ Buenas prácticas:

1. **Usa tokens con expiración** en producción
2. **Rota el token regularmente** (cada 3-6 meses)
3. **Revoca tokens viejos** cuando crees uno nuevo
4. **No compartas el token** - cada desarrollador debe tener el suyo

### ⚠️ Si el token se filtra:

1. Ve a: https://github.com/settings/tokens
2. Encuentra el token comprometido
3. Click **"Delete"**
4. Genera un nuevo token
5. Actualiza `.env` con el nuevo token

## Alternativas sin token

Si prefieres no usar un token de GitHub:

### Opción 1: Upload manual con script
```bash
node scripts/upload-strip.js ./mi-archivo.jpg "Título" 2025-12-12
git push && npm run deploy
```

### Opción 2: Volver a Supabase Storage
Sigue las instrucciones en `scripts/setup-supabase-storage.sql`

## Limitaciones

- **Rate limit:** 5000 requests/hora para usuarios autenticados
- **File size:** GitHub API limita archivos a 100MB
- **Delay:** 1-2 minutos entre upload y deploy automático
- **Internet requerido:** No funciona offline

## Ventajas vs Supabase Storage

| Feature | GitHub Storage | Supabase Storage |
|---------|---------------|------------------|
| Costo | ✅ Gratis | ⚠️ Límites gratis pequeños |
| Versionado | ✅ Git history | ❌ No |
| Backup | ✅ En Git | ⚠️ Requiere configuración |
| Speed | ⚠️ 1-2 min deploy | ✅ Instantáneo |
| Límite archivos | ⚠️ 1GB repo total | ✅ 100GB gratis |
| CDN | ✅ GitHub Pages | ✅ Supabase CDN |
