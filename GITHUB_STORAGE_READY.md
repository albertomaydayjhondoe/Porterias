# ✅ Sistema GitHub Storage Implementado

## Estado Actual

El admin panel ahora está configurado para subir archivos **directamente al repositorio de GitHub** usando la API.

## 🔧 Configuración Necesaria (Una Sola Vez)

### 1. Crear GitHub Personal Access Token

**Ve a:** https://github.com/settings/tokens/new

**Configura:**
- **Note:** `Porterias Admin Upload`
- **Expiration:** No expiration (o elige periodo)
- **Scopes:** Marca solo `repo` (Full control)

**Click:** Generate token → **COPIA EL TOKEN**

### 2. Configurar Token en el Proyecto

```bash
# En tu terminal local (CodeSpaces o tu máquina)
cd /workspaces/Porterias

# Edita el archivo .env
nano .env

# Reemplaza YOUR_TOKEN_HERE con tu token real:
VITE_GITHUB_TOKEN=ghp_tu_token_aqui_1234567890
```

### 3. Reiniciar servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C) y reinicia:
npm run dev
```

## 🚀 Cómo Usar

1. Ve a: https://albertomaydayjhondoe.github.io/Porterias/admin
2. Login: `sampayo@gmail.com` / `Bac2317?`
3. Selecciona archivo (imagen o video)
4. Añade título y fecha
5. Click "Subir"

**El sistema automáticamente:**
- ✅ Sube el archivo a `src/assets/strips/`
- ✅ Actualiza `public/data/strips.json`
- ✅ Hace commit al repositorio
- ✅ GitHub Pages re-despliega (1-2 minutos)

## 📂 Estructura Generada

```
src/assets/strips/
  ├── strip-2025-12-12-1733234567890.jpg
  └── strip-2025-12-12-1733234567891.mp4

public/data/strips.json (actualizado automáticamente)
```

## ⚡ Ventajas

- ✅ **Sin dependencia de Supabase Storage**
- ✅ **Todo versionado en Git**
- ✅ **Gratis (GitHub Pages incluido)**
- ✅ **Backup automático en Git**
- ✅ **Deploy automático**

## ⚠️ Limitaciones

- Delay de 1-2 minutos para ver cambios (GitHub Pages rebuild)
- Tamaño máximo de archivo: 50MB (configurable)
- Rate limit: 5000 requests/hora (suficiente para uso normal)

## 🔒 Seguridad

- ✅ Token en `.env` (no se commitea)
- ✅ Solo admin autenticado puede subir
- ✅ Validación de archivos (MIME types, tamaño)
- ✅ Rate limiting del lado de GitHub

## 📖 Documentación Completa

Ver: `GITHUB_TOKEN_SETUP.md` para troubleshooting y opciones avanzadas

## 🧪 Testing

```bash
# 1. Asegúrate que el token está configurado
cat .env | grep VITE_GITHUB_TOKEN

# 2. Inicia el servidor
npm run dev

# 3. Ve a /admin y prueba subir una imagen pequeña
```

Si ves "GitHub token not configured", verifica que:
- El token está en `.env`
- Reiniciaste el servidor después de editar `.env`
- El token tiene el scope `repo`

## 🆘 Soporte

Si algo falla, revisa:
1. Console del navegador (F12) para errores
2. Network tab para ver la request a GitHub API
3. `GITHUB_TOKEN_SETUP.md` para troubleshooting
