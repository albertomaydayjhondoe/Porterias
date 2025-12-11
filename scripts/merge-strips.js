#!/usr/bin/env node

/**
 * Script para fusionar y deduplicar strips.json
 * Combina los datos existentes de src/data/strips.ts con public/data/strips.json
 * y genera un archivo JSON unificado y deduplicado.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRIPS_JSON = path.join(__dirname, '..', 'public', 'data', 'strips.json');
const STRIPS_TS = path.join(__dirname, '..', 'src', 'data', 'strips.ts');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function loadExistingStrips() {
  try {
    const data = await fs.readFile(STRIPS_JSON, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log('⚠️  No se pudo cargar public/data/strips.json, iniciando con estructura vacía', 'yellow');
    return { strips: [] };
  }
}

async function parseStripsFromTs() {
  try {
    const content = await fs.readFile(STRIPS_TS, 'utf-8');
    
    // Extraer datos del array comicStrips
    const stripsMatch = content.match(/export const comicStrips: ComicStrip\[\] = \[([\s\S]*?)\];/);
    if (!stripsMatch) {
      log('⚠️  No se encontró el array comicStrips en strips.ts', 'yellow');
      return [];
    }
    
    const stripsData = stripsMatch[1];
    const strips = [];
    
    // Parsear cada objeto strip
    const stripObjects = stripsData.match(/\{[\s\S]*?\}/g) || [];
    
    for (const stripObj of stripObjects) {
      const id = stripObj.match(/id:\s*"([^"]*)"/)?.[1];
      const imageUrl = stripObj.match(/imageUrl:\s*strip(\d+)/)?.[1];
      const date = stripObj.match(/date:\s*"([^"]*)"/)?.[1];
      const title = stripObj.match(/title:\s*"([^"]*)"/)?.[1];
      
      if (id && imageUrl) {
        strips.push({
          id: id,
          title: title || `Strip ${id}`,
          image_url: `/Porterias/strips/strip-${imageUrl.padStart(3, '0')}.png`,
          publish_date: date || new Date().toISOString().split('T')[0],
          media_type: 'image'
        });
      }
    }
    
    return strips;
  } catch (error) {
    log(`⚠️  Error al parsear strips.ts: ${error.message}`, 'yellow');
    return [];
  }
}

function deduplicateStrips(strips) {
  const seen = new Map();
  const deduplicated = [];
  
  for (const strip of strips) {
    // Usar el ID o la URL de la imagen como clave de deduplicación
    const key = strip.id || strip.image_url;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      deduplicated.push(strip);
    } else {
      log(`   🔄 Duplicado omitido: ${strip.title || strip.id}`, 'yellow');
    }
  }
  
  return deduplicated;
}

async function mergeStrips() {
  log('\n🔄 Iniciando fusión de strips...', 'cyan');
  
  // Cargar strips existentes del JSON
  const existingData = await loadExistingStrips();
  log(`✅ Cargados ${existingData.strips.length} strips desde JSON`, 'green');
  
  // Parsear strips del TypeScript
  const tsStrips = await parseStripsFromTs();
  log(`✅ Parseados ${tsStrips.length} strips desde TypeScript`, 'green');
  
  // Combinar todos los strips
  const allStrips = [...existingData.strips, ...tsStrips];
  log(`📊 Total de strips antes de deduplicar: ${allStrips.length}`, 'cyan');
  
  // Deduplicar
  const deduplicated = deduplicateStrips(allStrips);
  log(`✅ Strips después de deduplicar: ${deduplicated.length}`, 'green');
  
  // Ordenar por fecha de publicación (más reciente primero)
  deduplicated.sort((a, b) => {
    const dateA = new Date(a.publish_date);
    const dateB = new Date(b.publish_date);
    return dateB - dateA;
  });
  
  // Guardar resultado
  const result = { strips: deduplicated };
  await fs.writeFile(STRIPS_JSON, JSON.stringify(result, null, 2));
  
  log('\n✅ Fusión completada exitosamente!', 'green');
  log(`📝 Archivo guardado: ${STRIPS_JSON}`, 'cyan');
  log(`📊 Total de strips únicos: ${deduplicated.length}`, 'cyan');
  
  // Mostrar resumen
  log('\n📋 Resumen de strips:', 'cyan');
  deduplicated.forEach((strip, index) => {
    log(`   ${index + 1}. ${strip.title} (${strip.publish_date})`, 'reset');
  });
}

// Main
mergeStrips().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
