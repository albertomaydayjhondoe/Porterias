#!/usr/bin/env node

/**
 * Script de administración con commits automáticos a GitHub
 * Permite agregar, eliminar y listar tiras cómicas con commits automáticos
 * 
 * Requiere: ADMIN_GH_TOKEN en variables de entorno
 * 
 * Uso:
 *   ADMIN_GH_TOKEN=tu_token node admin-github.mjs add --title "Mi Tira" --image "strip-001.png" --date "2025-12-10"
 *   ADMIN_GH_TOKEN=tu_token node admin-github.mjs list
 *   ADMIN_GH_TOKEN=tu_token node admin-github.mjs remove --id "001"
 * 
 * O configurar ADMIN_GH_TOKEN en .env o en GitHub Secrets
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuración del repositorio
const GITHUB_OWNER = 'albertomaydayjhondoe';
const GITHUB_REPO = 'Porterias';
const GITHUB_BRANCH = 'main';

const STRIPS_JSON = path.join(rootDir, 'public', 'data', 'strips.json');
const STRIPS_DIR = path.join(rootDir, 'public', 'strips');
const STRIPS_JSON_REPO_PATH = 'public/data/strips.json';

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
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function detectMediaType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  return 'image';
}

/**
 * Hacer commit automático a GitHub usando la API
 */
async function commitToGitHub(message, newContent) {
  const token = process.env.ADMIN_GH_TOKEN;
  
  if (!token) {
    log('⚠️  ADMIN_GH_TOKEN no está configurado. No se hará commit automático.', 'yellow');
    log('   Para commits automáticos, configura ADMIN_GH_TOKEN en:', 'yellow');
    log('   - Variables de entorno del sistema', 'yellow');
    log('   - Archivo .env (no commitear)', 'yellow');
    log('   - GitHub Secrets (Settings → Secrets → Repository secrets)', 'yellow');
    return false;
  }

  try {
    log('🔄 Preparando commit a GitHub...', 'cyan');
    
    // 1. Obtener el SHA del archivo actual
    const getFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${STRIPS_JSON_REPO_PATH}?ref=${GITHUB_BRANCH}`;
    const getFileResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Porterias-Admin'
      }
    });

    let sha = null;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
      log(`✓ Archivo encontrado (SHA: ${sha.substring(0, 7)}...)`, 'green');
    } else if (getFileResponse.status === 404) {
      log('  Archivo no existe aún, será creado', 'yellow');
    } else {
      throw new Error(`Error al obtener archivo: ${getFileResponse.statusText}`);
    }

    // 2. Codificar contenido en base64
    const contentBase64 = Buffer.from(newContent).toString('base64');

    // 3. Crear/actualizar el archivo
    const updateFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${STRIPS_JSON_REPO_PATH}`;
    const updatePayload = {
      message: message,
      content: contentBase64,
      branch: GITHUB_BRANCH
    };

    if (sha) {
      updatePayload.sha = sha;
    }

    const updateResponse = await fetch(updateFileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Porterias-Admin'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Error al actualizar archivo: ${errorData.message || updateResponse.statusText}`);
    }

    const result = await updateResponse.json();
    log('✅ Commit creado exitosamente:', 'green');
    log(`   Commit: ${result.commit.sha.substring(0, 7)}`, 'cyan');
    log(`   Mensaje: ${message}`, 'cyan');
    log(`   URL: ${result.commit.html_url}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Error al hacer commit: ${error.message}`, 'red');
    log('   Los cambios se guardaron localmente pero no se commitaron', 'yellow');
    return false;
  }
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

  // Determinar el tipo de medio y construir las URLs (usar /strips/ para Porterias)
  if (imagePath) {
    newStrip.image_url = `/strips/${imagePath}`;
    newStrip.media_type = detectMediaType(imagePath);
  }

  if (videoPath) {
    newStrip.video_url = `/strips/${videoPath}`;
    newStrip.media_type = 'video';
    if (!imagePath) {
      newStrip.image_url = `/strips/${videoPath}`;
    }
  }

  if (audioPath) {
    newStrip.audio_url = `/strips/${audioPath}`;
    newStrip.media_type = 'audio';
    if (!imagePath) {
      newStrip.image_url = `/strips/audio-placeholder.png`;
    }
  }

  // Agregar al inicio (más reciente primero)
  data.strips.unshift(newStrip);
  
  // Guardar localmente
  await saveStrips(data);

  log('\n✅ Tira agregada exitosamente:', 'green');
  log(`   ID: ${newStrip.id}`, 'cyan');
  log(`   Título: ${newStrip.title}`, 'cyan');
  log(`   Fecha: ${newStrip.publish_date}`, 'cyan');
  log(`   Tipo: ${newStrip.media_type}`, 'cyan');
  
  // Intentar commit automático
  let newContent;
  try {
    newContent = JSON.stringify(data, null, 2);
    // Validate JSON
    JSON.parse(newContent);
  } catch (error) {
    log('❌ Error al serializar datos JSON:', 'red');
    log('   No se hará commit automático', 'yellow');
    return;
  }
  
  const commitMessage = `Agregar nueva tira: ${title}`;
  const committed = await commitToGitHub(commitMessage, newContent);
  
  if (!committed) {
    log('\n📝 Pasos manuales:', 'yellow');
    log('   1. Coloca el archivo en public/strips/', 'yellow');
    log(`      cp tu-archivo.ext public/strips/${imagePath || videoPath || audioPath}`, 'yellow');
    log('   2. Haz commit y push:', 'yellow');
    log('      git add .', 'yellow');
    log(`      git commit -m "Agregar nueva tira: ${title}"`, 'yellow');
    log('      git push', 'yellow');
  } else {
    log('\n📝 Siguiente paso:', 'yellow');
    log('   Asegúrate de que el archivo de imagen/video esté en public/strips/', 'yellow');
    log(`   Si falta, súbelo manualmente a: public/strips/${imagePath || videoPath || audioPath}`, 'yellow');
  }
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
  
  // Intentar commit automático
  let newContent;
  try {
    newContent = JSON.stringify(data, null, 2);
    // Validate JSON
    JSON.parse(newContent);
  } catch (error) {
    log('❌ Error al serializar datos JSON:', 'red');
    log('   No se hará commit automático', 'yellow');
    return;
  }
  
  const commitMessage = `Eliminar tira: ${removed.title}`;
  const committed = await commitToGitHub(commitMessage, newContent);
  
  if (!committed) {
    log('\n📝 Pasos manuales:', 'yellow');
    log('   git add .', 'yellow');
    log(`   git commit -m "Eliminar tira: ${removed.title}"`, 'yellow');
    log('   git push', 'yellow');
  }
  
  log('\n⚠️  Recuerda eliminar también el archivo físico si lo deseas:', 'yellow');
  if (removed.image_url) {
    log(`   rm public/strips/${path.basename(removed.image_url)}`, 'yellow');
  }
}

function showHelp() {
  log('\n📖 Porterias Admin - Gestión con GitHub API', 'cyan');
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
  
  log('\n⚙️  Configuración:\n', 'magenta');
  log(`   Owner: ${GITHUB_OWNER}`, 'cyan');
  log(`   Repo: ${GITHUB_REPO}`, 'cyan');
  log(`   Branch: ${GITHUB_BRANCH}`, 'cyan');
  log(`   Token: ${process.env.ADMIN_GH_TOKEN ? '✓ Configurado' : '✗ No configurado'}`, process.env.ADMIN_GH_TOKEN ? 'green' : 'red');
  
  log('\n💡 Para configurar ADMIN_GH_TOKEN:', 'yellow');
  log('   1. En local: export ADMIN_GH_TOKEN=tu_token', 'reset');
  log('   2. En GitHub Actions: Settings → Secrets → ADMIN_GH_TOKEN', 'reset');
  log('   3. En .env: ADMIN_GH_TOKEN=tu_token (no commitear)', 'reset');
  
  log('\nEjemplos:\n', 'yellow');
  log('  ADMIN_GH_TOKEN=tu_token node admin-github.mjs add --title "Nueva Tira" --image "strip-021.png"', 'cyan');
  log('  node admin-github.mjs list', 'cyan');
  log('  ADMIN_GH_TOKEN=tu_token node admin-github.mjs remove --id "abc123"', 'cyan');
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
  console.error(error);
  process.exit(1);
});
