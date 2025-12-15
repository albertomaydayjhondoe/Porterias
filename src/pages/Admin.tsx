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
import { GITHUB_CONFIG } from "@/lib/github-config";
import { supabase } from "@/integrations/supabase/client";

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

  const uploadToGitHub = async (fileName: string, fileContent: string, commitMessage: string): Promise<boolean> => {
    const GITHUB_TOKEN = GITHUB_CONFIG.GITHUB_TOKEN || localStorage.getItem('github_token');

    if (!GITHUB_TOKEN) {
      toast.error("Token de GitHub no configurado. Añade VITE_GITHUB_TOKEN a tu .env");
      return false;
    }

    try {
      // 1. Obtener SHA actual del archivo (si existe)
      let fileSha = null;
      try {
        const getResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${fileName}`,
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );
        if (getResponse.ok) {
          const fileData = await getResponse.json();
          fileSha = fileData.sha;
        }
      } catch (error) {
        // Archivo no existe, continuamos sin SHA
      }

      // 2. Subir archivo al repositorio
      const uploadResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${fileName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: fileContent,
            ...(fileSha && { sha: fileSha }),
          }),
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(`GitHub API Error: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Error subiendo a GitHub:', error);
      throw new Error(`Error subiendo a GitHub: ${error.message}`);
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

      // 1. Convertir archivo a base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remover el prefijo data:type;base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // 2. Generar ID único
      const maxId = strips.reduce((max, s) => {
        const num = parseInt(s.id.replace(/\D/g, '') || '0');
        return num > max ? num : max;
      }, 0);
      const newId = `strip-${String(maxId + 1).padStart(3, '0')}`;

      const sanitizedTitle = title.trim().slice(0, 200);

      // 3. Subir archivo multimedia al repositorio
      toast("📤 Subiendo archivo multimedia...", { duration: 2000 });
      await uploadToGitHub(
        `strips/${fileName}`,
        fileBase64,
        `Add ${mediaType}: ${sanitizedTitle || fileName}`
      );

      // 4. Cargar JSON actual del repositorio y actualizarlo
      let currentStrips: any[] = [];
      try {
        const response = await fetch(`https://raw.githubusercontent.com/albertomaydayjhondoe/Porteria/main/data/strips.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          currentStrips = data.strips || [];
        }
      } catch (error) {
        console.log('No se pudo cargar strips.json del repositorio, creando nuevo');
      }

      // 5. Añadir nuevo strip al inicio
      const stripData = {
        id: newId,
        title: sanitizedTitle || null,
        image_url: mediaType === 'image' ? `./strips/${fileName}` : null,
        video_url: mediaType === 'video' ? `./strips/${fileName}` : null,
        media_type: mediaType,
        publish_date: publishDate,
      };

      currentStrips.unshift(stripData);

      // 6. Generar y subir JSON actualizado
      const updatedJson = {
        strips: currentStrips,
        last_updated: new Date().toISOString()
      };

      const jsonContent = btoa(unescape(encodeURIComponent(JSON.stringify(updatedJson, null, 2))));
      
      toast("📝 Actualizando base de datos...", { duration: 2000 });
      await uploadToGitHub(
        'data/strips.json',
        jsonContent,
        `Update strips.json: Add ${sanitizedTitle || newId}`
      );

      // 7. Actualizar lista local
      const newStrip: LocalStrip = {
        id: newId,
        title: sanitizedTitle || null,
        image_url: mediaType === 'image' ? `./strips/${fileName}` : null,
        video_url: mediaType === 'video' ? `./strips/${fileName}` : null,
        media_type: mediaType,
        publish_date: publishDate,
        file: selectedFile,
      };

      setStrips(prev => [newStrip, ...prev]);

      toast.success(
        `🎉 ${mediaType === 'video' ? '🎥 Video' : '🖼️ Imagen'} subido al repositorio exitosamente!\n✅ Disponible en la web en ~1 minuto`
      );
      
      // Reset form
      setTitle("");
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Error en upload:', error);
      toast.error(error.message || "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const loadStrips = async () => {
    try {
      // Cargar desde JSON local
      const response = await fetch('./data/strips.json');
      if (response.ok) {
        const data = await response.json();
        const mappedStrips: LocalStrip[] = (data.strips || [])
          .slice(0, 20) // Límite de 20 elementos
          .map((strip: any) => ({
            id: strip.id,
            title: strip.title,
            image_url: strip.image_url,
            video_url: strip.video_url,
            media_type: strip.media_type as 'image' | 'video',
            publish_date: strip.publish_date,
          }));
        setStrips(mappedStrips);
      }
    } catch (error) {
      console.log('No se pudo cargar strips.json, usando datos vacíos');
      setStrips([]);
    }
  };

  const handleDelete = (stripId: string) => {
    if (!confirm('⚠️ Esto solo elimina de la vista local.\n¿Continuar?')) {
      return;
    }

    // Encontrar el strip para generar instrucciones
    const strip = strips.find(s => s.id === stripId);
    if (strip) {
      const mediaUrl = strip.video_url || strip.image_url || '';
      const fileName = mediaUrl ? mediaUrl.split('/').pop() : '';

      const instructions = `
📋 Para eliminar "${strip.title || strip.id}":

1. Elimina: public/strips/${fileName}
2. Edita public/data/strips.json y elimina la entrada con id: "${strip.id}"
3. git add . && git commit -m "Remove ${strip.id}" && git push
      `.trim();

      navigator.clipboard.writeText(instructions);
      toast.success("Instrucciones de eliminación copiadas al portapapeles");
    }

    // Solo eliminar de la lista local (no del archivo JSON)
    setStrips(prev => prev.filter(s => s.id !== stripId));
    
    toast.success("Eliminado de la vista local");
  };

  // Cargar strips al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      loadStrips();
    }
  }, [isAuthenticated]);

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

          {/* GitHub Token Configuration */}
          <div className="border-2 border-amber-500 p-6 bg-amber-50 mb-6 rounded">
            <h3 className="font-bold mb-3 text-amber-800">🔑 Configuración de GitHub Token</h3>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Pega tu token de GitHub aquí (ghp_...)"
                className="border-2 border-amber-500"
                onChange={(e) => {
                  if (e.target.value) {
                    localStorage.setItem('github_token', e.target.value);
                    toast.success("Token configurado correctamente");
                  }
                }}
              />
              <p className="text-xs text-amber-700">
                📋 <strong>Crea tu token:</strong> GitHub Settings → Tokens → Generate new (classic) → Permisos: repo, contents:write
              </p>
              <p className="text-xs text-green-700">
                {localStorage.getItem('github_token') ? '✅ Token configurado' : '⚠️ Token no configurado'}
              </p>
            </div>
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
                    Subiendo al repositorio...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir al Repositorio
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Uploaded items */}
          {strips.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contenido en el Repositorio</h2>
              
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
                        <p className="text-xs text-green-600">✅ Publicado automáticamente</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(strip.id)}
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
                      {(strip.image_url || strip.file) && (
                        <img
                          src={strip.image_url || (strip.file ? URL.createObjectURL(strip.file) : '')}
                          alt={strip.title || "Imagen"}
                          className="w-20 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-grow">
                        <h4 className="font-bold">{strip.title || "Sin título"}</h4>
                        <p className="text-xs text-muted-foreground">{strip.publish_date}</p>
                        <p className="text-xs text-green-600">✅ Publicado automáticamente</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(strip.id)}
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
          <div className="mt-12 border-2 border-dashed border-green-500/30 p-6 rounded bg-green-50">
            <h3 className="font-bold mb-2 text-green-800">🚀 Upload Directo al Repositorio:</h3>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>Selecciona un archivo (video o imagen)</li>
              <li>Click en "Subir al Repositorio"</li>
              <li>Se sube automáticamente vía GitHub API</li>
              <li>Aparece en la web en ~1 minuto</li>
              <li>Sin pasos manuales adicionales</li>
            </ol>
            <p className="text-xs text-green-600 mt-3 font-medium">
              ⚡ Videos → Página principal | Imágenes → Archivo | Todo automático
            </p>
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Requiere VITE_GITHUB_TOKEN en .env (ver README.md)
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
