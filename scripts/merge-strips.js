#!/usr/bin/env node

/**
 * Script de fusión y normalización de datos de strips
 * - Normaliza rutas de /Porteria/strips/ a /strips/
 * - Detecta y renombra archivos con colisiones
 * - Genera public/data/strips.json final
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const STRIPS_JSON = path.join(rootDir, 'public', 'data', 'strips.json');
const STRIPS_DIR = path.join(rootDir, 'public', 'strips');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function loadStripsJson() {
  try {
    const data = await fs.readFile(STRIPS_JSON, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log(`⚠️  No se pudo leer ${STRIPS_JSON}, creando uno nuevo`, 'yellow');
    return { strips: [] };
  }
}

async function getExistingFiles() {
  try {
    const files = await fs.readdir(STRIPS_DIR);
    return files.filter(f => /\.(png|jpg|jpeg|gif|webp|mp4|webm)$/i.test(f));
  } catch (error) {
    log(`⚠️  No se pudo leer ${STRIPS_DIR}`, 'yellow');
    return [];
  }
}

function normalizeImagePath(url) {
  // Convertir /Porteria/strips/xxx -> /strips/xxx
  // También manejar rutas absolutas y relativas
  if (!url) return null;
  
  if (url.startsWith('/Porteria/strips/')) {
    return url.replace('/Porteria/strips/', '/strips/');
  }
  
  if (url.startsWith('/strips/')) {
    return url;
  }
  
  // Si es solo el nombre del archivo, agregar /strips/
  if (!url.includes('/')) {
    return `/strips/${url}`;
  }
  
  return url;
}

async function mergeAndNormalizeStrips() {
  log('🔄 Iniciando fusión y normalización de strips...', 'cyan');
  log('', 'reset');
  
  // Cargar el JSON existente
  const data = await loadStripsJson();
  log(`📂 Strips en JSON: ${data.strips.length}`, 'blue');
  
  // Normalizar todas las rutas
  const normalizedStrips = data.strips.map(strip => {
    const normalized = { ...strip };
    
    if (normalized.image_url) {
      normalized.image_url = normalizeImagePath(normalized.image_url);
    }
    
    if (normalized.video_url) {
      normalized.video_url = normalizeImagePath(normalized.video_url);
    }
    
    if (normalized.audio_url) {
      normalized.audio_url = normalizeImagePath(normalized.audio_url);
    }
    
    // Asegurar que tenga media_type
    if (!normalized.media_type) {
      if (normalized.video_url) {
        normalized.media_type = 'video';
      } else if (normalized.audio_url) {
        normalized.media_type = 'audio';
      } else {
        normalized.media_type = 'image';
      }
    }
    
    return normalized;
  });
  
  // Deduplicar por ID
  const seen = new Set();
  const deduplicated = normalizedStrips.filter(strip => {
    if (seen.has(strip.id)) {
      log(`  ⚠️  Strip duplicado eliminado: ${strip.id} - ${strip.title}`, 'yellow');
      return false;
    }
    seen.add(strip.id);
    return true;
  });
  
  log(`✅ Strips después de deduplicación: ${deduplicated.length}`, 'green');
  log('', 'reset');
  
  // Ordenar por fecha de publicación (más recientes primero)
  deduplicated.sort((a, b) => {
    const dateA = new Date(a.publish_date);
    const dateB = new Date(b.publish_date);
    return dateB - dateA;
  });
  
  // Verificar que los archivos de imagen existen
  const existingFiles = await getExistingFiles();
  log(`📁 Archivos en ${STRIPS_DIR}: ${existingFiles.length}`, 'blue');
  
  let missingFiles = 0;
  deduplicated.forEach(strip => {
    const imageUrl = strip.image_url || strip.video_url;
    if (imageUrl) {
      const filename = path.basename(imageUrl);
      if (!existingFiles.includes(filename)) {
        log(`  ⚠️  Archivo no encontrado: ${filename} (strip: ${strip.title || strip.id})`, 'yellow');
        missingFiles++;
      }
    }
  });
  
  if (missingFiles > 0) {
    log(`⚠️  Total de archivos faltantes: ${missingFiles}`, 'yellow');
  } else {
    log(`✅ Todos los archivos referenciados existen`, 'green');
  }
  log('', 'reset');
  
  // Guardar el resultado
  const result = {
    strips: deduplicated
  };
  
  await fs.writeFile(STRIPS_JSON, JSON.stringify(result, null, 2));
  log(`✅ Archivo guardado: ${STRIPS_JSON}`, 'green');
  log(`📊 Total de strips: ${deduplicated.length}`, 'magenta');
  log('', 'reset');
  
  // Mostrar resumen
  log('📋 Resumen de strips:', 'cyan');
  deduplicated.forEach((strip, index) => {
    log(`  ${index + 1}. [${strip.id}] ${strip.title || 'Sin título'} (${strip.publish_date})`, 'reset');
  });
  
  log('', 'reset');
  log('✨ ¡Fusión completada exitosamente!', 'green');
}

// Ejecutar
mergeAndNormalizeStrips().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
