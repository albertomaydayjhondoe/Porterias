/**
 * Data service for loading comic strips from local JSON file
 */

export interface ComicStrip {
  id: string;
  title: string;
  image_url: string;
  publish_date: string;
  media_type?: 'image' | 'video' | 'audio';
  video_url?: string;
  audio_url?: string;
}

/**
 * Load comic strips from the local JSON file
 */
export async function loadStrips(): Promise<ComicStrip[]> {
  try {
    const response = await fetch('/Porterias/data/strips.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.strips || [];
  } catch (error) {
    console.error("Error loading strips from JSON:", error);
    // Return empty array if loading fails
    return [];
  }
}

/**
 * Get the most recent strip
 */
export async function getTodayStrip(): Promise<ComicStrip | null> {
  const strips = await loadStrips();
  return strips.length > 0 ? strips[0] : null;
}

/**
 * Get a strip by ID
 */
export async function getStripById(id: string): Promise<ComicStrip | null> {
  const strips = await loadStrips();
  return strips.find(strip => strip.id === id) || null;
}

/**
 * Get a strip by index
 */
export async function getStripByIndex(index: number): Promise<ComicStrip | null> {
  const strips = await loadStrips();
  return strips[index] || null;
}
