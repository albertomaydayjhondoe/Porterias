/**
 * Service for fetching comic strips data
 * Reads from local /data/strips.json file
 */

export interface ComicStrip {
  id: string;
  title: string | null;
  image_url: string;
  publish_date: string;
  media_type?: 'image' | 'video' | 'audio';
  video_url?: string;
  audio_url?: string;
}

interface StripsData {
  strips: ComicStrip[];
}

/**
 * Fetch strips from local JSON file
 */
export async function fetchStrips(): Promise<ComicStrip[]> {
  try {
    // Fetch with timeout (3 seconds for local file)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('/data/strips.json', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Archivo strips.json no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor al cargar strips');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    
    const data: StripsData = await response.json();
    
    // Validate data structure
    if (!data.strips || !Array.isArray(data.strips)) {
      throw new Error('Formato de datos inválido');
    }
    
    // Return strips sorted by date (most recent first)
    return data.strips.sort((a, b) => {
      const dateA = new Date(a.publish_date);
      const dateB = new Date(b.publish_date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Timeout al cargar strips');
        throw new Error('Timeout al cargar strips');
      }
      console.error('Error fetching strips:', error.message);
    } else {
      console.error('Error fetching strips:', error);
    }
    throw error;
  }
}

/**
 * Get the latest strip
 */
export async function getLatestStrip(): Promise<ComicStrip | null> {
  try {
    const strips = await fetchStrips();
    return strips.length > 0 ? strips[0] : null;
  } catch (error) {
    console.error('Error getting latest strip:', error);
    return null;
  }
}

/**
 * Get a strip by ID
 */
export async function getStripById(id: string): Promise<ComicStrip | null> {
  try {
    const strips = await fetchStrips();
    return strips.find(strip => strip.id === id) || null;
  } catch (error) {
    console.error('Error getting strip by ID:', error);
    return null;
  }
}
