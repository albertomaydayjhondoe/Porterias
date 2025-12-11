import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOGImage() {
  // Crear canvas de 1200x630 (tamaño recomendado para Open Graph)
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo oscuro (color del tema)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Borde superior con color primary
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, width, 8);

  // Título "PAPERBOY"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAPERBOY', width / 2, 200);

  // Subtítulo "La Portería"
  ctx.fillStyle = '#94a3b8';
  ctx.font = '32px sans-serif';
  ctx.letterSpacing = '0.3em';
  ctx.fillText('LA PORTERÍA', width / 2, 260);

  // Descripción
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '28px sans-serif';
  ctx.fillText('Tiras cómicas diarias', width / 2, 360);
  ctx.fillText('con estilo minimalista tipo periódico', width / 2, 410);

  // Línea decorativa
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 460);
  ctx.lineTo(width / 2 + 200, 460);
  ctx.stroke();

  // URL
  ctx.fillStyle = '#64748b';
  ctx.font = '24px monospace';
  ctx.fillText('albertomaydayjhondoe.github.io/Porterias', width / 2, 540);

  // Guardar la imagen
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  fs.writeFileSync(outputPath, buffer);
  console.log('✓ Imagen Open Graph generada:', outputPath);
}

generateOGImage().catch(console.error);
