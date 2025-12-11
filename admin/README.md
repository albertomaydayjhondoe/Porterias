# Admin Panel - Porterias

Sistema de administración local para gestionar tiras cómicas del sitio Porterias sin necesidad de Supabase.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ instalado
- Acceso al repositorio `albertomaydayjhondoe/Porterias`
- (Opcional) Token de GitHub para commits automáticos

### Instalación

No requiere instalación adicional. El script `admin.mjs` en la raíz del proyecto está listo para usar.

```bash
node admin.mjs help
```

## 📋 Comandos Disponibles

### Agregar una Nueva Tira

```bash
# Agregar una imagen
node admin.mjs add --title "Mi Nueva Tira" --image "strip-021.png" --date "2025-12-11"

# Agregar un video con thumbnail
node admin.mjs add --title "Tira Animada" --video "video-001.mp4" --image "thumb-001.png"

# La fecha es opcional (por defecto: hoy)
node admin.mjs add --title "Tira de Hoy" --image "strip-022.png"
```

**Nota:** Después de agregar una tira, debes colocar el archivo físico en `public/strips/`:

```bash
cp mi-archivo.png public/strips/strip-021.png
```

### Listar Todas las Tiras

```bash
node admin.mjs list
```

Muestra todas las tiras con su ID, título, fecha, tipo y URLs.

### Eliminar una Tira

```bash
node admin.mjs remove --id "abc123xyz"
```

Elimina la tira del archivo `strips.json`. El archivo físico debe eliminarse manualmente si es necesario.

### Hacer Commit (en desarrollo)

```bash
node admin.mjs commit --message "Add new comic strip"
```

**Nota:** Esta función requiere el token `ADMIN_GH_TOKEN` configurado (ver sección de configuración).

## 🔑 Configuración del Token de GitHub

Para usar la funcionalidad de commits automáticos, necesitas configurar un Personal Access Token de GitHub.

### 1. Crear el Token

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Dale un nombre descriptivo: "Porterias Admin"
4. Selecciona los siguientes permisos:
   - `repo` (Full control of private repositories)
5. Click en "Generate token"
6. **Copia el token** (no podrás verlo de nuevo)

### 2. Configurar el Token Localmente

Para desarrollo local, configura el token como variable de entorno:

**Linux/Mac:**
```bash
export ADMIN_GH_TOKEN="ghp_tu_token_aqui"
```

**Windows (PowerShell):**
```powershell
$env:ADMIN_GH_TOKEN="ghp_tu_token_aqui"
```

O agrégalo a tu archivo `~/.bashrc` o `~/.zshrc`:
```bash
echo 'export ADMIN_GH_TOKEN="ghp_tu_token_aqui"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Configurar el Token en GitHub Actions

Para automatización con GitHub Actions:

1. Ve a tu repositorio → Settings → Secrets and variables → Actions
2. Click en "New repository secret"
3. Nombre: `ADMIN_GH_TOKEN`
4. Value: Tu token de GitHub
5. Click en "Add secret"

**IMPORTANTE:** 
- ❌ **NUNCA** incluyas el token directamente en el código
- ❌ **NUNCA** hagas commit del token al repositorio
- ✅ Usa siempre variables de entorno
- ✅ Mantén el token seguro y privado

## 📁 Estructura de Archivos

```
Porterias/
├── admin.mjs                    # Script de administración
├── admin/
│   └── README.md               # Esta documentación
├── public/
│   ├── data/
│   │   └── strips.json         # Metadata de todas las tiras
│   └── strips/
│       ├── strip-001.png       # Archivos de tiras
│       ├── strip-002.png
│       └── ...
└── scripts/
    └── merge-strips.js         # Script de merge/deduplicación
```

## 📝 Formato del strips.json

El archivo `public/data/strips.json` tiene la siguiente estructura:

```json
{
  "strips": [
    {
      "id": "unique-id-123",
      "title": "Título de la Tira",
      "publish_date": "2025-12-11",
      "image_url": "/Porterias/strips/strip-001.png",
      "media_type": "image"
    }
  ]
}
```

### Campos:

- `id`: Identificador único (generado automáticamente)
- `title`: Título de la tira
- `publish_date`: Fecha de publicación (YYYY-MM-DD)
- `image_url`: Ruta a la imagen (base path: /Porterias/)
- `media_type`: Tipo de medio ("image", "video", "audio")
- `video_url`: (Opcional) Ruta al video
- `audio_url`: (Opcional) Ruta al audio

## 🔄 Workflow Típico

1. **Crear la tira** (diseño gráfico, etc.)

2. **Agregar metadata:**
   ```bash
   node admin.mjs add --title "Nueva Aventura" --image "strip-021.png"
   ```

3. **Copiar archivo:**
   ```bash
   cp ~/Downloads/strip-021.png public/strips/
   ```

4. **Verificar:**
   ```bash
   node admin.mjs list
   ```

5. **Commit y push:**
   ```bash
   git add public/data/strips.json public/strips/strip-021.png
   git commit -m "Add strip 021: Nueva Aventura"
   git push
   ```

6. **Deploy automático** (GitHub Actions se encarga)

## 🛠️ Scripts Auxiliares

### merge-strips.js

Script para fusionar y deduplicar datos de strips:

```bash
node scripts/merge-strips.js
```

Este script:
- Combina datos de múltiples fuentes
- Elimina duplicados basándose en IDs
- Actualiza paths de `/Porteria/` a `/Porterias/`
- Verifica que los archivos existan
- Ordena por fecha de publicación

## ⚠️ Notas de Seguridad

1. **Tokens:** Nunca incluyas tokens en el código o en commits
2. **Backups:** Haz backup de `strips.json` antes de operaciones masivas
3. **Validación:** Verifica que los archivos existan antes de hacer deploy
4. **Permisos:** El token de GitHub debe tener los permisos mínimos necesarios

## 🐛 Troubleshooting

### "ADMIN_GH_TOKEN no está configurado"

El token no está en las variables de entorno. Sigue los pasos en "Configuración del Token de GitHub".

### "No se encontró una tira con ID: xxx"

El ID especificado no existe. Usa `node admin.mjs list` para ver los IDs disponibles.

### "Error al leer strips.json"

El archivo puede estar corrupto o no existir. Verifica:
```bash
cat public/data/strips.json | jq .
```

## 📚 Más Información

- Repositorio: https://github.com/albertomaydayjhondoe/Porterias
- GitHub Pages: https://albertomaydayjhondoe.github.io/Porterias/
- Issues: https://github.com/albertomaydayjhondoe/Porterias/issues

## 📄 Licencia

Este proyecto es parte de Porterias y sigue la misma licencia del repositorio principal.
