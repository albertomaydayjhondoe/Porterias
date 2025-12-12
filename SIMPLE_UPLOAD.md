# Sistema Simple de Upload - Porterias

## ¿Cómo funciona?

Sistema ultra simple basado en archivos estáticos:
- Archivos en `public/strips/`
- Metadata en `public/data/strips.json`
- Deploy automático en GitHub Pages

## Método 1: Desde el Admin Web

1. Ve a `/admin` y login
2. Selecciona archivo, título y fecha
3. Click "Subir"
4. El archivo se descarga con las instrucciones
5. Sigue las instrucciones para completar el upload

## Método 2: Script Automático (Recomendado)

```bash
./scripts/simple-upload.sh <archivo> [titulo] [fecha]
```

**Ejemplos:**
```bash
# Upload con todo
./scripts/simple-upload.sh ~/Downloads/tira.jpg "Mi Nueva Tira" 2025-12-12

# Solo archivo (usa fecha de hoy)
./scripts/simple-upload.sh ~/Downloads/video.mp4

# Con título
./scripts/simple-upload.sh ~/Downloads/imagen.png "Tira del Día"
```

El script:
1. Copia el archivo a `public/strips/`
2. Genera el ID automáticamente
3. Te da el JSON para añadir a `strips.json`
4. Opcional: abre el editor para que edites directamente

## Método 3: Manual Completo

1. **Copia el archivo:**
   ```bash
   cp mi-archivo.jpg public/strips/strip-2025-12-12-1234567890.jpg
   ```

2. **Edita `public/data/strips.json`:**
   Añade al inicio del array `strips`:
   ```json
   {
     "id": "strip-021",
     "title": "Mi Tira",
     "image_url": "/Porterias/strips/strip-2025-12-12-1234567890.jpg",
     "video_url": null,
     "media_type": "image",
     "publish_date": "2025-12-12"
   }
   ```

3. **Commit y deploy:**
   ```bash
   git add public/strips/ public/data/strips.json
   git commit -m "Add strip: strip-021"
   git push && npm run deploy
   ```

## Estructura de Archivos

```
public/
├── strips/
│   ├── strip-2025-12-09-1733234567.png
│   ├── strip-2025-12-10-1733234568.mp4
│   └── strip-2025-12-11-1733234569.jpg
└── data/
    └── strips.json
```

## strips.json Format

```json
{
  "strips": [
    {
      "id": "strip-021",
      "title": "Tira del Día",
      "image_url": "/Porterias/strips/strip-021.png",
      "video_url": null,
      "media_type": "image",
      "publish_date": "2025-12-12"
    }
  ]
}
```

**Para videos:**
- `image_url`: null
- `video_url`: "/Porterias/strips/archivo.mp4"
- `media_type`: "video"

## Formatos Soportados

- **Imágenes:** JPG, PNG, GIF, WebP
- **Videos:** MP4, WebM, OGG

## Ventajas

✅ Sin configuración compleja  
✅ Sin tokens ni APIs  
✅ Todo versionado en Git  
✅ Deploy automático  
✅ Máxima simplicidad  
✅ Funciona offline

## Desventajas

⚠️ No hay upload desde producción (solo desde dev)  
⚠️ Requiere acceso al repositorio  
⚠️ Proceso semi-manual

## Backup

Siempre está disponible el backup con el sistema complejo:
```bash
git checkout backup-github-api-20251212
```
