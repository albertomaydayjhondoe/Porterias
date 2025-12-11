#!/usr/bin/env node

/**
 * Script to merge and deduplicate strips data
 * Combines data from Porteria's strips.json with local src/data/strips.ts
 * Updates paths from /Porteria/ to /Porterias/
 * Deduplicates based on strip ID
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRIPS_JSON_PATH = path.join(__dirname, '..', 'public', 'data', 'strips.json');
const SRC_STRIPS_PATH = path.join(__dirname, '..', 'src', 'data', 'strips.ts');

console.log('🔄 Starting strips merge and deduplication...\n');

// Read existing strips.json
let stripsData;
try {
  const content = fs.readFileSync(STRIPS_JSON_PATH, 'utf-8');
  stripsData = JSON.parse(content);
  console.log(`✅ Loaded ${stripsData.strips.length} strips from public/data/strips.json`);
} catch (error) {
  console.error('❌ Error reading strips.json:', error.message);
  process.exit(1);
}

// Extract data from src/data/strips.ts
let srcStrips = [];
try {
  const srcContent = fs.readFileSync(SRC_STRIPS_PATH, 'utf-8');
  
  // Parse the comicStrips array from the TypeScript file
  const arrayMatch = srcContent.match(/export const comicStrips: ComicStrip\[\] = \[([\s\S]*?)\];/);
  if (arrayMatch) {
    // Extract individual strip objects
    const stripsText = arrayMatch[1];
    const stripMatches = stripsText.matchAll(/\{[^}]*id:\s*"(\d+)"[^}]*title:\s*"([^"]*)"[^}]*date:\s*"([^"]*)"[^}]*\}/g);
    
    for (const match of stripMatches) {
      const [, id, title, date] = match;
      srcStrips.push({
        id: id.padStart(3, '0'),
        title: title,
        publish_date: date,
        image_url: `/Porterias/strips/strip-${id.padStart(3, '0')}.png`,
        media_type: 'image'
      });
    }
    console.log(`✅ Extracted ${srcStrips.length} strips from src/data/strips.ts`);
  }
} catch (error) {
  console.log('⚠️  Warning: Could not parse src/data/strips.ts:', error.message);
}

// Update paths from /Porteria/ to /Porterias/ in existing strips
stripsData.strips = stripsData.strips.map(strip => ({
  ...strip,
  image_url: strip.image_url ? strip.image_url.replace('/Porteria/', '/Porterias/') : strip.image_url,
  video_url: strip.video_url ? strip.video_url.replace('/Porteria/', '/Porterias/') : strip.video_url,
  audio_url: strip.audio_url ? strip.audio_url.replace('/Porteria/', '/Porterias/') : strip.audio_url
}));

console.log('✅ Updated paths from /Porteria/ to /Porterias/');

// Merge strips from src/data/strips.ts
const existingIds = new Set(stripsData.strips.map(s => s.id));
const newStrips = srcStrips.filter(s => !existingIds.has(s.id));

if (newStrips.length > 0) {
  stripsData.strips.push(...newStrips);
  console.log(`✅ Added ${newStrips.length} new strips from src/data/strips.ts`);
}

// Sort strips by publish_date (descending - newest first)
stripsData.strips.sort((a, b) => {
  const dateA = new Date(a.publish_date);
  const dateB = new Date(b.publish_date);
  return dateB - dateA;
});

console.log('✅ Sorted strips by publish date (newest first)');

// Remove duplicates (keep first occurrence based on ID)
const seenIds = new Set();
const dedupedStrips = [];
for (const strip of stripsData.strips) {
  if (!seenIds.has(strip.id)) {
    seenIds.add(strip.id);
    dedupedStrips.push(strip);
  }
}

const duplicatesRemoved = stripsData.strips.length - dedupedStrips.length;
if (duplicatesRemoved > 0) {
  console.log(`✅ Removed ${duplicatesRemoved} duplicate(s)`);
  stripsData.strips = dedupedStrips;
}

// Check for missing strip files
console.log('\n📁 Checking strip files...');
const stripsDir = path.join(__dirname, '..', 'public', 'strips');
let missingFiles = 0;

for (const strip of stripsData.strips) {
  if (strip.image_url) {
    const filename = strip.image_url.split('/').pop();
    const filepath = path.join(stripsDir, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  Missing file: ${filename}`);
      missingFiles++;
    }
  }
}

if (missingFiles === 0) {
  console.log('✅ All strip files exist');
} else {
  console.log(`⚠️  Warning: ${missingFiles} file(s) missing`);
}

// Write updated strips.json
try {
  fs.writeFileSync(STRIPS_JSON_PATH, JSON.stringify(stripsData, null, 2));
  console.log('\n✅ Successfully updated public/data/strips.json');
  console.log(`📊 Final count: ${stripsData.strips.length} strips`);
} catch (error) {
  console.error('❌ Error writing strips.json:', error.message);
  process.exit(1);
}

console.log('\n✨ Merge complete!\n');
