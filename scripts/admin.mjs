#!/usr/bin/env node

/**
 * Script de administración local para Porterias
 * Permite agregar, eliminar y listar tiras cómicas sin necesidad de Supabase
 * 
 * Uso:
 *   node scripts/admin.mjs add --title "Mi Tira" --image "strip-001.png" --date "2025-12-10"
 *   node scripts/admin.mjs add --title "Video" --video "video-001.mp4" --date "2025-12-10"
 *   node scripts/admin.mjs list
 *   node scripts/admin.mjs remove --id "001"
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since script is in scripts/ directory, go up one level to root
const STRIPS_JSON = path.join(__dirname, '..', 'public', 'data', 'strips.json');
const STRIPS_DIR = path.join(__dirname, '..', 'public', 'strips');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function loadStrips() {
  try {
    const data = await fs.readFile(STRIPS_JSON, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { strips: [] };
  }
}

async function saveStrips(data) {
  await fs.writeFile(STRIPS_JSON, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function detectMediaType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  return 'image';
}

async function addStrip(args) {
  const title = args.title;
  const imagePath = args.image;
  const videoPath = args.video;
  const audioPath = args.audio;
  const date = args.date || new Date().toISOString().split('T')[0];

  if (!title) {
    log('❌ Error: --title es requerido', 'red');
    return;
  }

  if (!imagePath && !videoPath && !audioPath) {
    log('❌ Error: Debes especificar --image, --video o --audio', 'red');
    return;
  }

  const data = await loadStrips();
  
  const newStrip = {
    id: generateId(),
    title,
    publish_date: date
  };

  // Determinar el tipo de medio y construir las URLs
  if (imagePath) {
    newStrip.image_url = `/Porterias/strips/${imagePath}`;
    newStrip.media_type = detectMediaType(imagePath);
  }

  if (videoPath) {
    newStrip.video_url = `/Porterias/strips/${videoPath}`;
    newStrip.media_type = 'video';
    if (!imagePath) {
      // Si no hay imagen, usar el video como imagen también
      newStrip.image_url = `/Porterias/strips/${videoPath}`;
    }
  }

  if (audioPath) {
    newStrip.audio_url = `/Porterias/strips/${audioPath}`;
    newStrip.media_type = 'audio';
    if (!imagePath) {
      newStrip.image_url = `/Porterias/strips/audio-placeholder.png`;
    }
  }

  data.strips.unshift(newStrip);
  await saveStrips(data);

  log('\n✅ Tira agregada exitosamente:', 'green');
  log(`   ID: ${newStrip.id}`, 'cyan');
  log(`   Título: ${newStrip.title}`, 'cyan');
  log(`   Fecha: ${newStrip.publish_date}`, 'cyan');
  log(`   Tipo: ${newStrip.media_type}`, 'cyan');
  log('\n📝 Siguiente paso: Coloca el archivo en public/strips/', 'yellow');
  log(`   cp tu-archivo.ext public/strips/${imagePath || videoPath || audioPath}`, 'yellow');
  log('\n🚀 Luego haz commit y push:', 'yellow');
  log('   git add .', 'yellow');
  log('   git commit -m "Agregar nueva tira"', 'yellow');
  log('   git push', 'yellow');
}

async function listStrips() {
  const data = await loadStrips();
  
  if (data.strips.length === 0) {
    log('📭 No hay tiras en el archivo', 'yellow');
    return;
  }

  log(`\n📚 Total de tiras: ${data.strips.length}\n`, 'cyan');
  
  data.strips.forEach((strip, index) => {
    log(`${index + 1}. ${strip.title}`, 'green');
    log(`   ID: ${strip.id}`, 'reset');
    log(`   Fecha: ${strip.publish_date}`, 'reset');
    log(`   Tipo: ${strip.media_type || 'image'}`, 'reset');
    if (strip.image_url) log(`   Imagen: ${strip.image_url}`, 'reset');
    if (strip.video_url) log(`   Video: ${strip.video_url}`, 'reset');
    if (strip.audio_url) log(`   Audio: ${strip.audio_url}`, 'reset');
    log('');
  });
}

async function removeStrip(args) {
  const id = args.id;
  
  if (!id) {
    log('❌ Error: --id es requerido', 'red');
    return;
  }

  const data = await loadStrips();
  const index = data.strips.findIndex(s => s.id === id);
  
  if (index === -1) {
    log(`❌ No se encontró una tira con ID: ${id}`, 'red');
    return;
  }

  const removed = data.strips.splice(index, 1)[0];
  await saveStrips(data);

  log('\n✅ Tira eliminada:', 'green');
  log(`   Título: ${removed.title}`, 'cyan');
  log(`   Fecha: ${removed.publish_date}`, 'cyan');
  log('\n⚠️  Recuerda eliminar también el archivo físico si lo deseas:', 'yellow');
  if (removed.image_url) log(`   rm public/strips/${path.basename(removed.image_url)}`, 'yellow');
}

function showHelp() {
  log('\n📖 Porteria Admin - Gestión Local de Tiras', 'cyan');
  log('\nComandos disponibles:\n', 'yellow');
  
  log('  add      Agregar nueva tira', 'green');
  log('           --title "Título"        (requerido)', 'reset');
  log('           --image "file.png"      (imagen/video/audio)', 'reset');
  log('           --video "file.mp4"      (opcional, si es video)', 'reset');
  log('           --audio "file.mp3"      (opcional, si es audio)', 'reset');
  log('           --date "2025-12-10"     (opcional, default: hoy)', 'reset');
  
  log('\n  list     Listar todas las tiras', 'green');
  
  log('\n  remove   Eliminar una tira', 'green');
  log('           --id "abc123"           (requerido)', 'reset');
  
  log('\n  help     Mostrar esta ayuda', 'green');
  
  log('\nEjemplos:\n', 'yellow');
  log('  node admin.mjs add --title "Nueva Tira" --image "strip-001.png"', 'cyan');
  log('  node admin.mjs add --title "Video Animado" --video "video-001.mp4" --image "thumb-001.png"', 'cyan');
  log('  node admin.mjs list', 'cyan');
  log('  node admin.mjs remove --id "abc123"', 'cyan');
  log('');
}

// Parser simple de argumentos
function parseArgs(args) {
  const parsed = { _: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      parsed[key] = args[i + 1] || true;
      i++;
    } else {
      parsed._.push(args[i]);
    }
  }
  return parsed;
}

// Main
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  // Crear directorios si no existen
  await fs.mkdir(path.dirname(STRIPS_JSON), { recursive: true });
  await fs.mkdir(STRIPS_DIR, { recursive: true });

  switch (command) {
    case 'add':
      await addStrip(args);
      break;
    case 'list':
      await listStrips();
      break;
    case 'remove':
      await removeStrip(args);
      break;
    case 'help':
    default:
      showHelp();
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
