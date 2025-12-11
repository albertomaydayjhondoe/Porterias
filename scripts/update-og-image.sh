#!/bin/bash
# Script para actualizar la imagen Open Graph con la última tira

echo "🔄 Actualizando imagen Open Graph con la última tira..."
python3 scripts/generate-og-image-dynamic.py

if [ $? -eq 0 ]; then
    echo "✅ Imagen actualizada correctamente"
    echo ""
    echo "Para desplegar los cambios ejecuta:"
    echo "  npm run deploy"
else
    echo "❌ Error al generar la imagen"
    exit 1
fi
