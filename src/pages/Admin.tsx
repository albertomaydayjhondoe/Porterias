import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Lock, LogOut } from "lucide-react";
import {
  validateFileType,
  validateFileSize,
  isVideoFile,
  SECURITY_CONFIG
} from "@/lib/security";

// Simple local authentication - no Supabase required
const ADMIN_PASSWORD = "porteria2024";

interface LocalStrip {
  id: string;
  title: string | null;
  image_url: string | null;
  video_url: string | null;
  media_type: 'image' | 'video';
  publish_date: string;
  file?: File;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  
  const [strips, setStrips] = useState<LocalStrip[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check for saved session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check lockout
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingSeconds = Math.ceil((lockoutTime - Date.now()) / 1000);
      toast.error(`Demasiados intentos. Espera ${remainingSeconds} segundos`);
      return;
    }

    if (!password) {
      toast.error("Introduce la contraseña");
      return;
    }

    setAuthLoading(true);

    // Simple password check
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        setLoginAttempts(0);
        setLockoutTime(null);
        toast.success("Acceso concedido");
        setPassword("");
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutTime(Date.now() + 5 * 60 * 1000);
          toast.error("Demasiados intentos. Bloqueado por 5 minutos");
        } else {
          toast.error("Contraseña incorrecta");
        }
      }
      setAuthLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setStrips([]);
    toast.success("Sesión cerrada");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileType(file)) {
        toast.error("Solo se permiten imágenes (JPG, PNG, GIF, WebP) y videos (MP4, WebM, OGG)");
        e.target.value = '';
        return;
      }
      
      if (!validateFileSize(file)) {
        toast.error(`El archivo no debe superar ${SECURITY_CONFIG.MAX_FILE_SIZE_MB}MB`);
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Selecciona una imagen o video");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(publishDate)) {
      toast.error("Formato de fecha inválido");
      return;
    }

    setUploading(true);

    try {
      const mediaType = isVideoFile(selectedFile) ? 'video' : 'image';
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${mediaType}-${publishDate}-${timestamp}.${fileExt}`;

      // Download file for manual upload
      const url = URL.createObjectURL(selectedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Generate next ID
      const maxId = strips.reduce((max, s) => {
        const num = parseInt(s.id.replace(/\D/g, '') || '0');
        return num > max ? num : max;
      }, 0);
      const newId = `strip-${String(maxId + 1).padStart(3, '0')}`;

      const sanitizedTitle = title.trim().slice(0, 200);

      // Create local entry
      const newStrip: LocalStrip = {
        id: newId,
        title: sanitizedTitle || null,
        image_url: mediaType === 'image' ? `/Porterias/strips/${fileName}` : null,
        video_url: mediaType === 'video' ? `/Porterias/strips/${fileName}` : null,
        media_type: mediaType,
        publish_date: publishDate,
        file: selectedFile,
      };

      // Add to local list
      setStrips(prev => [newStrip, ...prev]);

      // Generate instructions
      const instructions = `
✅ Archivo descargado: ${fileName}

📋 Pasos para completar:

1. Mueve el archivo a:
   public/strips/${fileName}

2. Edita public/data/strips.json y añade al inicio del array "strips":
${JSON.stringify({
  id: newId,
  title: sanitizedTitle || null,
  image_url: mediaType === 'image' ? `/Porterias/strips/${fileName}` : null,
  video_url: mediaType === 'video' ? `/Porterias/strips/${fileName}` : null,
  media_type: mediaType,
  publish_date: publishDate,
}, null, 2)}

3. Ejecuta:
   git add public/strips/${fileName} public/data/strips.json
   git commit -m "Add ${mediaType}: ${sanitizedTitle || fileName}"
   git push
      `.trim();

      await navigator.clipboard.writeText(instructions);
      
      toast.success(
        mediaType === 'video' 
          ? "Video descargado → Instrucciones copiadas" 
          : "Imagen descargada → Instrucciones copiadas"
      );

      setTitle("");
      setPublishDate(new Date().toISOString().split('T')[0]);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (strip: LocalStrip) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    
    setStrips(prev => prev.filter(s => s.id !== strip.id));
    
    const mediaUrl = strip.video_url || strip.image_url || '';
    const fileName = mediaUrl.split('/').pop();

    const instructions = `
📋 Para eliminar "${strip.title || strip.id}":

1. Elimina: public/strips/${fileName}
2. Edita public/data/strips.json y elimina la entrada con id: "${strip.id}"
3. git add . && git commit -m "Remove ${strip.id}" && git push
    `.trim();

    navigator.clipboard.writeText(instructions);
    toast.success("Instrucciones copiadas al portapapeles");
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16 px-6">
          <div className="w-full max-w-md">
            <div className="border-2 border-primary p-8 bg-card shadow-editorial">
              <div className="text-center mb-8">
                <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h1 className="text-3xl font-bold">Panel Admin</h1>
                <p className="text-muted-foreground mt-2">
                  Introduce la contraseña para acceder
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="border-2 border-primary"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="inline-block border-2 border-primary px-6 py-2 mb-4">
                <p className="text-xs tracking-[0.3em] uppercase font-medium">
                  Panel de Administración
                </p>
              </div>
              <h1 className="text-5xl font-bold tracking-tight">
                Gestión de Contenido
              </h1>
              <p className="text-muted-foreground mt-2">
                Videos → Página Principal | Imágenes → Buzón/Archivo
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-2 border-primary">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>

          {/* Upload form */}
          <div className="border-2 border-primary p-8 bg-card shadow-editorial mb-12">
            <h2 className="text-2xl font-bold mb-6">Subir Nuevo Contenido</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                  Título (opcional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-primary"
                  placeholder="Nombre del contenido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                  Fecha de Publicación
                </label>
                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="border-2 border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                  Archivo (Imagen o Video)
                </label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="border-2 border-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Videos (MP4, WebM) → Página principal | Imágenes (JPG, PNG) → Archivo
                </p>
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir y Descargar
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Uploaded items this session */}
          {strips.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Subidos esta sesión</h2>
              
              {/* Videos */}
              {strips.filter(s => s.media_type === 'video').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary pb-2">
                    📹 Videos (Página Principal)
                  </h3>
                  {strips.filter(s => s.media_type === 'video').map((strip) => (
                    <div key={strip.id} className="border-2 border-primary p-4 bg-card flex gap-4 items-center">
                      <div className="w-20 h-14 bg-muted rounded flex items-center justify-center text-xs">
                        VIDEO
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold">{strip.title || "Sin título"}</h4>
                        <p className="text-xs text-muted-foreground">{strip.publish_date}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(strip)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Images */}
              {strips.filter(s => s.media_type === 'image').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary pb-2">
                    🖼️ Imágenes (Archivo/Buzón)
                  </h3>
                  {strips.filter(s => s.media_type === 'image').map((strip) => (
                    <div key={strip.id} className="border-2 border-primary p-4 bg-card flex gap-4 items-center">
                      {strip.file && (
                        <img
                          src={URL.createObjectURL(strip.file)}
                          alt={strip.title || "Imagen"}
                          className="w-20 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-grow">
                        <h4 className="font-bold">{strip.title || "Sin título"}</h4>
                        <p className="text-xs text-muted-foreground">{strip.publish_date}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(strip)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 border-2 border-dashed border-muted-foreground/30 p-6 rounded">
            <h3 className="font-bold mb-2">📋 Cómo funciona:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Sube un archivo (video o imagen)</li>
              <li>El archivo se descargará automáticamente</li>
              <li>Las instrucciones se copian al portapapeles</li>
              <li>Sigue los pasos para añadirlo al repositorio</li>
            </ol>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
