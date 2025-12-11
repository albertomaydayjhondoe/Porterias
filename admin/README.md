# Admin Panel - Porterias

Sistema de administración para gestionar tiras cómicas con commits automáticos a GitHub.

## 📋 Contenido

- `admin-github.mjs` - Script principal con integración GitHub API
- `README.md` - Este archivo

## 🚀 Uso Rápido

### Listar todas las tiras

```bash
node admin/admin-github.mjs list
```

### Agregar nueva tira (con commit automático)

```bash
ADMIN_GH_TOKEN=tu_token node admin/admin-github.mjs add \
  --title "Nueva Tira Cómica" \
  --image "strip-021.png" \
  --date "2025-12-11"
```

### Eliminar una tira (con commit automático)

```bash
ADMIN_GH_TOKEN=tu_token node admin/admin-github.mjs remove --id "abc123"
```

### Ver ayuda

```bash
node admin/admin-github.mjs help
```

## 🔐 Configuración de ADMIN_GH_TOKEN

Para que los commits automáticos funcionen, necesitas configurar el token de GitHub.

### Opción 1: Variable de entorno (recomendado para uso local)

```bash
export ADMIN_GH_TOKEN=ghp_tu_token_aqui
```

Para hacerlo permanente, agrégalo a tu `~/.bashrc` o `~/.zshrc`:

```bash
echo 'export ADMIN_GH_TOKEN=ghp_tu_token_aqui' >> ~/.bashrc
source ~/.bashrc
```

### Opción 2: GitHub Secrets (para GitHub Actions)

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Nombre: `ADMIN_GH_TOKEN`
5. Valor: tu token de GitHub (ghp_...)

### Opción 3: Archivo .env (NO RECOMENDADO - no commitear)

Crear archivo `.env` en la raíz:

```
ADMIN_GH_TOKEN=ghp_tu_token_aqui
```

**⚠️ IMPORTANTE**: Asegúrate de que `.env` esté en `.gitignore`

## 🔑 Crear Token de GitHub

1. Ve a GitHub.com → Settings (tu perfil)
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Nombre: "Porterias Admin"
5. Permisos necesarios:
   - ✅ `repo` (acceso completo al repositorio)
6. Generate token
7. **Copia el token inmediatamente** (no se volverá a mostrar)

## 📦 Configuración del Repositorio

El script está configurado para:

- **Owner**: `albertomaydayjhondoe`
- **Repo**: `Porterias`
- **Branch**: `main`
- **Archivo**: `public/data/strips.json`

Para cambiar estos valores, edita las constantes al inicio de `admin-github.mjs`:

```javascript
const GITHUB_OWNER = 'albertomaydayjhondoe';
const GITHUB_REPO = 'Porterias';
const GITHUB_BRANCH = 'main';
```

## 📝 Formato de Datos

El archivo `public/data/strips.json` tiene el siguiente formato:

```json
{
  "strips": [
    {
      "id": "abc123",
      "title": "Título de la Tira",
      "publish_date": "2025-12-11",
      "image_url": "/strips/strip-001.png",
      "media_type": "image"
    }
  ]
}
```

### Campos:

- `id` - Identificador único (generado automáticamente)
- `title` - Título de la tira
- `publish_date` - Fecha de publicación (YYYY-MM-DD)
- `image_url` - Ruta a la imagen (relativa desde la raíz del sitio)
- `media_type` - Tipo de medio: `image`, `video`, o `audio`
- `video_url` - (opcional) Ruta al video
- `audio_url` - (opcional) Ruta al audio

## 🎨 Soporte de Medios

### Imágenes
```bash
node admin/admin-github.mjs add --title "Mi Tira" --image "strip-021.png"
```

### Videos
```bash
node admin/admin-github.mjs add \
  --title "Animación" \
  --video "video-001.mp4" \
  --image "thumb-001.jpg"
```

### Audio
```bash
node admin/admin-github.mjs add \
  --title "Podcast" \
  --audio "audio-001.mp3" \
  --image "cover-001.jpg"
```

## 📂 Estructura de Archivos

```
Porterias/
├── admin/
│   ├── admin-github.mjs      # Script principal
│   └── README.md             # Esta documentación
├── public/
│   ├── data/
│   │   └── strips.json       # Datos de las tiras
│   └── strips/
│       ├── strip-001.png     # Archivos de imágenes
│       ├── strip-002.png
│       └── ...
└── scripts/
    └── merge-strips.js       # Script de fusión/normalización
```

## 🔧 Flujo de Trabajo

### 1. Agregar nueva tira

```bash
# 1. Agregar registro en strips.json con commit automático
ADMIN_GH_TOKEN=tu_token node admin/admin-github.mjs add \
  --title "Nueva Tira" \
  --image "strip-021.png"

# 2. Subir el archivo de imagen al repositorio
cp ~/mi-tira.png public/strips/strip-021.png
git add public/strips/strip-021.png
git commit -m "Agregar imagen: strip-021.png"
git push
```

### 2. Sin token configurado (modo manual)

```bash
# 1. Agregar registro localmente
node admin/admin-github.mjs add --title "Nueva Tira" --image "strip-021.png"

# 2. Hacer commit manual
git add public/data/strips.json public/strips/strip-021.png
git commit -m "Agregar nueva tira: Nueva Tira"
git push
```

## 🛠️ Troubleshooting

### Error: "ADMIN_GH_TOKEN no está configurado"

**Solución**: Configura el token siguiendo la sección "Configuración de ADMIN_GH_TOKEN"

### Error: "Error al actualizar archivo"

**Causas posibles**:
- Token inválido o expirado
- Token sin permisos `repo`
- Rama incorrecta

**Solución**: Verifica tu token y permisos

### Error: "Authentication failed"

**Solución**: Regenera tu token en GitHub con los permisos correctos

## 📊 Scripts Relacionados

### merge-strips.js

Script de normalización y fusión de datos:

```bash
node scripts/merge-strips.js
```

Este script:
- Normaliza las rutas de `/Porteria/strips/` a `/strips/`
- Elimina duplicados por ID
- Ordena por fecha
- Valida que los archivos existan

## 🔒 Seguridad

### ⚠️ IMPORTANTE: No commitear tokens

**NUNCA** incluyas tokens en:
- Código fuente
- Archivos de configuración commiteados
- Documentación pública

**SÍ** incluye tokens en:
- Variables de entorno
- GitHub Secrets
- Archivos `.env` (en `.gitignore`)

### Buenas Prácticas

1. Usa GitHub Secrets para CI/CD
2. Usa variables de entorno para desarrollo local
3. Rota tokens periódicamente
4. Usa tokens con permisos mínimos necesarios
5. No compartas tokens por chat/email

## 📚 Referencias

- [GitHub API - Contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🆘 Soporte

Para problemas o preguntas:

1. Revisa esta documentación
2. Ejecuta `node admin/admin-github.mjs help`
3. Verifica los logs de error
4. Revisa la configuración del token

---

**Última actualización**: 2025-12-11
**Versión**: 1.0.0
