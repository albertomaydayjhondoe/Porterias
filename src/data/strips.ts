// Comic strips data - now loaded from JSON file
export interface ComicStrip {
  id: string;
  imageUrl: string;
  date: string;
  title?: string;
  media_type?: string;
  video_url?: string;
  audio_url?: string;
}

interface StripsData {
  strips: Array<{
    id: string;
    title: string;
    publish_date: string;
    image_url: string;
    media_type?: string;
    video_url?: string;
    audio_url?: string;
  }>;
}

let cachedStrips: ComicStrip[] | null = null;

// Fetch strips from local JSON file
export const fetchComicStrips = async (): Promise<ComicStrip[]> => {
  if (cachedStrips) {
    return cachedStrips;
  }

  try {
    const response = await fetch('/data/strips.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch strips: ${response.statusText}`);
    }
    
    const data: StripsData = await response.json();
    
    // Transform to ComicStrip format
    cachedStrips = data.strips.map(strip => ({
      id: strip.id,
      imageUrl: strip.image_url,
      date: strip.publish_date,
      title: strip.title,
      media_type: strip.media_type,
      video_url: strip.video_url,
      audio_url: strip.audio_url,
    }));
    
    return cachedStrips;
  } catch (error) {
    console.error('Error loading comic strips:', error);
    // Return empty array as fallback
    return [];
  }
};

// Synchronous version for backwards compatibility (will be empty until data is loaded)
export const comicStrips: ComicStrip[] = [];

// Get today's strip (latest strip)
export const getTodayStrip = async (): Promise<ComicStrip | null> => {
  const strips = await fetchComicStrips();
  return strips.length > 0 ? strips[0] : null;
};

// Get strip by ID
export const getStripById = async (id: string): Promise<ComicStrip | undefined> => {
  const strips = await fetchComicStrips();
  return strips.find(strip => strip.id === id);
};

// Get strip by index
export const getStripByIndex = async (index: number): Promise<ComicStrip | undefined> => {
  const strips = await fetchComicStrips();
  return strips[index];
};

// Clear cache (useful for development/testing)
export const clearStripsCache = () => {
  cachedStrips = null;
};
