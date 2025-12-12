#!/bin/bash

# Simple upload script for Porterias
# Usage: ./scripts/simple-upload.sh <file> [title] [date]

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar un archivo"
    echo "Uso: ./scripts/simple-upload.sh <archivo> [titulo] [fecha]"
    echo "Ejemplo: ./scripts/simple-upload.sh ~/Downloads/imagen.jpg \"Mi Tira\" 2025-12-12"
    exit 1
fi

SOURCE_FILE="$1"
TITLE="${2:-}"
PUBLISH_DATE="${3:-$(date +%Y-%m-%d)}"

if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: El archivo no existe: $SOURCE_FILE"
    exit 1
fi

# Get file extension
EXT="${SOURCE_FILE##*.}"
EXT=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

# Generate filename
TIMESTAMP=$(date +%s%3N)
FILENAME="strip-${PUBLISH_DATE}-${TIMESTAMP}.${EXT}"
DEST_PATH="public/strips/$FILENAME"

# Detect media type
if [[ "$EXT" == "mp4" || "$EXT" == "webm" || "$EXT" == "ogg" ]]; then
    MEDIA_TYPE="video"
else
    MEDIA_TYPE="image"
fi

# Copy file
echo "📁 Copiando archivo a $DEST_PATH..."
cp "$SOURCE_FILE" "$DEST_PATH"

# Get next ID
STRIPS_JSON="public/data/strips.json"
if [ ! -f "$STRIPS_JSON" ]; then
    echo "❌ Error: No existe $STRIPS_JSON"
    exit 1
fi

# Read max ID (simple grep/awk approach)
MAX_ID=$(grep -o '"id": "strip-[0-9]*"' "$STRIPS_JSON" | grep -o '[0-9]*' | sort -n | tail -1)
NEXT_ID=$((MAX_ID + 1))
NEW_ID=$(printf "strip-%03d" $NEXT_ID)

# Create temp JSON for new entry
if [ "$MEDIA_TYPE" == "video" ]; then
    IMAGE_URL="null"
    VIDEO_URL="\"/Porterias/strips/$FILENAME\""
else
    IMAGE_URL="\"/Porterias/strips/$FILENAME\""
    VIDEO_URL="null"
fi

TITLE_JSON=$([ -n "$TITLE" ] && echo "\"$TITLE\"" || echo "null")

echo "
✅ Archivo copiado
📋 ID generado: $NEW_ID
📅 Fecha: $PUBLISH_DATE
🎬 Tipo: $MEDIA_TYPE

Ahora debes editar $STRIPS_JSON manualmente y añadir al inicio del array 'strips':

{
  \"id\": \"$NEW_ID\",
  \"title\": $TITLE_JSON,
  \"image_url\": $IMAGE_URL,
  \"video_url\": $VIDEO_URL,
  \"media_type\": \"$MEDIA_TYPE\",
  \"publish_date\": \"$PUBLISH_DATE\"
}

Luego ejecuta:
  git add public/strips/$FILENAME $STRIPS_JSON
  git commit -m \"Add strip: $NEW_ID\"
  git push && npm run deploy
"

read -p "¿Abrir $STRIPS_JSON para editar? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} "$STRIPS_JSON"
fi
