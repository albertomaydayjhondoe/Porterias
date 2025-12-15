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
  const [strips, setStrips] = useState<ComicStrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrips();
  }, []);

  const loadStrips = async () => {
    try {
      // Cargar desde JSON local del repositorio
      const response = await fetch('./data/strips.json');
      if (response.ok) {
        const data = await response.json();
        // Ordenar por fecha (más recientes primero)
        const allStrips = (data.strips || [])
          .sort((a: any, b: any) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
        
        setStrips(allStrips);
      } else {
        setStrips([]);
      }
    } catch (error: any) {
      console.error("Error loading strips:", error);
      setStrips([]);
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
            <h2 className="text-3xl font-bold mb-4">No hay contenido publicado aún</h2>
            <p className="text-muted-foreground mb-6">
              El contenido aparecerá aquí cuando se suba desde el panel de administración
            </p>
            <button
              onClick={() => navigate('/archivo')}
              className="inline-block border-2 border-primary px-8 py-3 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Ver Archivo
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const latestStrip = strips[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Latest strip (video or image) */}
        <StripViewer strips={strips.map(s => ({
          id: s.id,
          title: s.title,
          image_url: s.image_url || '',
          video_url: s.video_url || undefined,
          media_type: s.media_type as 'video' | 'image',
          publish_date: s.publish_date,
        }))} />

        {/* Call to action for archive */}
        <section className="py-16 px-6 text-center">
          <div className="container mx-auto max-w-2xl">
            <div className="border-2 border-primary p-12 bg-card shadow-editorial">
              <h3 className="text-3xl font-bold mb-4">
                Explora el Archivo
              </h3>
              <p className="text-muted-foreground mb-6">
                Visita el archivo completo para ver todo el contenido publicado
              </p>
              <button
                onClick={() => navigate('/archivo')}
                className="inline-block border-2 border-primary px-8 py-3 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Ver Archivo
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
