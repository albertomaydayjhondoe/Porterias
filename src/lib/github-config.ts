// Configuración del GitHub API
export const GITHUB_CONFIG = {
  // Configurar en variables de entorno o aquí directamente
  GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN || "", // Reemplaza con tu token real
  REPO_OWNER: "albertomaydayjhondoe",
  REPO_NAME: "Porteria",
  BRANCH: "main",
  
  // Rutas en el repositorio
  PATHS: {
    VIDEOS: "public/strips/",
    IMAGES: "public/strips/",
    DATA_JSON: "public/data/strips.json"
  }
};

// Configuración de archivos
export const FILE_CONFIG = {
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_SIZE_MB: 50
};