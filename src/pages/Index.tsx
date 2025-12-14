import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StripViewer from "@/components/StripViewer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ComicStrip {
  id: string;
  title: string | null;
  image_url: string | null;
  video_url: string | null;
  media_type: string;
  publish_date: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<ComicStrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      if (!supabase) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // Load only videos for homepage
      const { data, error } = await supabase
        .from("comic_strips")
        .select("*")
        .eq("media_type", "video")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error("Error loading videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-3xl font-bold mb-4">No hay videos publicados aún</h2>
            <p className="text-muted-foreground mb-6">
              Los videos aparecerán aquí cuando se suban desde el panel de administración
            </p>
            <button
              onClick={() => navigate('/archivo')}
              className="inline-block border-2 border-primary px-8 py-3 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Ver Archivo de Imágenes
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const latestVideo = videos[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Latest video */}
        <StripViewer strips={videos.map(v => ({
          id: v.id,
          title: v.title,
          image_url: v.image_url || '',
          video_url: v.video_url || undefined,
          media_type: 'video' as const,
          publish_date: v.publish_date,
        }))} />

        {/* Call to action for archive */}
        <section className="py-16 px-6 text-center">
          <div className="container mx-auto max-w-2xl">
            <div className="border-2 border-primary p-12 bg-card shadow-editorial">
              <h3 className="text-3xl font-bold mb-4">
                Explora el Buzón
              </h3>
              <p className="text-muted-foreground mb-6">
                Visita el archivo completo para ver todas las imágenes y tiras publicadas
              </p>
              <button
                onClick={() => navigate('/archivo')}
                className="inline-block border-2 border-primary px-8 py-3 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Ver Archivo de Imágenes
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
