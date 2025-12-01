import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Trash2 } from "lucide-react";

interface ComicStrip {
  id: string;
  title: string | null;
  image_url: string;
  publish_date: string;
}

const Admin = () => {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [strips, setStrips] = useState<ComicStrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Acceso denegado");
      navigate("/auth");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadStrips();
    }
  }, [isAdmin]);

  const loadStrips = async () => {
    try {
      const { data, error } = await supabase
        .from("comic_strips")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      setStrips(data || []);
    } catch (error: any) {
      toast.error("Error al cargar tiras: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Selecciona una imagen");
      return;
    }

    setUploading(true);

    try {
      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${publishDate}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("comic-strips")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("comic-strips")
        .getPublicUrl(filePath);

      // Insert strip record
      const { error: insertError } = await supabase
        .from("comic_strips")
        .insert({
          title: title || null,
          image_url: publicUrl,
          publish_date: publishDate,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      toast.success("Tira subida exitosamente");
      setTitle("");
      setPublishDate(new Date().toISOString().split('T')[0]);
      setSelectedFile(null);
      loadStrips();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (strip: ComicStrip) => {
    if (!confirm("¿Eliminar esta tira?")) return;

    try {
      // Extract file path from URL
      const urlParts = strip.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("comic-strips")
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("comic_strips")
        .delete()
        .eq("id", strip.id);

      if (dbError) throw dbError;

      toast.success("Tira eliminada");
      loadStrips();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block border-2 border-primary px-6 py-2 mb-4">
              <p className="text-xs tracking-[0.3em] uppercase font-medium">
                Panel de Administración
              </p>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Gestión de Tiras
            </h1>
          </div>

          {/* Upload form */}
          <div className="border-2 border-primary p-8 bg-card shadow-editorial mb-12">
            <h2 className="text-2xl font-bold mb-6">Subir Nueva Tira</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider">
                  Título (opcional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-primary"
                  placeholder="El Nuevo Inquilino"
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
                  Imagen de la Tira
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border-2 border-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full border-2 border-primary"
                variant="outline"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Tira
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Strips list */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tiras Publicadas</h2>
            {strips.map((strip) => (
              <div
                key={strip.id}
                className="border-2 border-primary p-6 bg-card shadow-newspaper flex gap-6"
              >
                <img
                  src={strip.image_url}
                  alt={strip.title || "Tira"}
                  className="w-32 h-32 object-cover"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold mb-2">
                    {strip.title || "Sin título"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(strip.publish_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(strip)}
                  className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {strips.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay tiras publicadas aún
              </p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
