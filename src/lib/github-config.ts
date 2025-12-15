// Configuración del GitHub API
export const GITHUB_CONFIG = {
  // Token desde variables de entorno o localStorage (configurar en el navegador)
  GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN || "", // Se configura desde el admin
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