# 🚀 Upload Directo al Repositorio - Guía de Configuración

## ¿Qué es esto?
El sistema de upload directo permite subir archivos desde el panel admin directamente al repositorio de GitHub, sin necesidad de descargar archivos ni pasos manuales.

## Configuración Requerida

### 1. Crear Token de GitHub
1. Ve a [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click en "Generate new token (classic)"
3. Selecciona estos permisos:
   - ✅ `repo` (acceso completo al repositorio)
   - ✅ `contents:write` (escribir archivos)

### 2. Configurar Variables de Entorno
Copia `.env.example` a `.env` y configura tu token:
```bash
cp .env.example .env
```

En `.env`:
```bash
VITE_GITHUB_TOKEN=ghp_tu_token_aqui
```

### 3. Para Netlify/Vercel (Producción)
Añade la variable de entorno en tu plataforma:
- **Variable:** `VITE_GITHUB_TOKEN`
- **Valor:** Tu token de GitHub

## Cómo Funciona

### Flujo Automático
1. **Usuario sube archivo** → Panel admin
2. **Se convierte a base64** → Preparación
3. **Upload vía GitHub API** → Directo al repo
4. **Actualiza JSON** → Automático
5. **Aparece en web** → ~1 minuto

### Tipos de Archivo
- **Videos** (MP4, WebM) → Página principal
- **Imágenes** (JPG, PNG, GIF) → Página de archivo

## Seguridad

⚠️ **IMPORTANTE:** Nunca commits el token en Git
- `.env` está en `.gitignore`
- Solo usa variables de entorno seguras
- El token tiene acceso completo a tu repo

## Troubleshooting

### Error: "Token de GitHub no configurado"
- Verifica que `VITE_GITHUB_TOKEN` esté en `.env`
- Reinicia el servidor de desarrollo
- Verifica que el token tenga los permisos correctos

### Error: "GitHub API Error"
- Verifica que el repositorio exista
- Confirma que el token tenga permisos de escritura
- Revisa que el nombre del repo sea correcto

### Upload funciona pero no aparece en web
- Los cambios tardan ~1 minuto en GitHub Pages
- Verifica que el archivo se haya subido a `/public/strips/`
- Revisa que `strips.json` se haya actualizado

## Ventajas vs Sistema Anterior

| Anterior | Nuevo |
|----------|--------|
| 📥 Descarga manual | ⚡ Upload automático |
| 📋 Copiar instrucciones | 🤖 Todo automático |
| 📁 Mover archivos a mano | 🎯 Directo al destino |
| 🔄 Commit manual | 📤 Commit automático |
| ⏰ 5+ pasos | ⚡ 1 click |

## Estructura de Archivos

```
public/
├── strips/           ← Videos e imágenes
│   ├── video1.mp4
│   └── image1.jpg
└── data/
    └── strips.json   ← Metadata (se actualiza automáticamente)
```

## Testing

Para probar en desarrollo:
```bash
npm run dev
```

1. Ve a `/admin`
2. Introduce contraseña: `porteria2024`
3. Sube un archivo de prueba
4. Verifica que aparezca automáticamente