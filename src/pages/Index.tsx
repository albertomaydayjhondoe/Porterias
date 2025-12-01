import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StripViewer from "@/components/StripViewer";
import ArchiveRoller from "@/components/ArchiveRoller";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ComicStrip {
  id: string;
  title: string | null;
  image_url: string;
  publish_date: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [strips, setStrips] = useState<ComicStrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStripIndex, setCurrentStripIndex] = useState(0);

  useEffect(() => {
    loadStrips();
  }, []);

  const loadStrips = async () => {
    try {
      const { data, error } = await supabase
        .from("comic_strips")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      
      setStrips(data || []);
      setCurrentStripIndex(0); // Start with the latest strip
    } catch (error: any) {
      toast.error("Error al cargar tiras");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStripIndex < strips.length - 1) {
      setCurrentStripIndex(currentStripIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentStripIndex > 0) {
      setCurrentStripIndex(currentStripIndex - 1);
    }
  };

  const handleStripClick = (id: string) => {
    const index = strips.findIndex(strip => strip.id === id);
    if (index !== -1) {
      setCurrentStripIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (strips.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">No hay tiras publicadas aún</h2>
            <p className="text-muted-foreground">Vuelve pronto para ver el contenido</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStrip = strips[currentStripIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Today's strip - vertical format */}
        <StripViewer
          imageUrl={currentStrip.image_url}
          date={currentStrip.publish_date}
          title={currentStrip.title || undefined}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasNext={currentStripIndex > 0}
          hasPrevious={currentStripIndex < strips.length - 1}
        />

        {/* Horizontal archive roller */}
        {strips.length > 1 && (
          <ArchiveRoller
            strips={strips.map(s => ({
              id: s.id,
              imageUrl: s.image_url,
              date: s.publish_date,
              title: s.title || undefined,
            }))}
            onStripClick={handleStripClick}
          />
        )}

        {/* Call to action */}
        <section className="py-16 px-6 text-center">
          <div className="container mx-auto max-w-2xl">
            <div className="border-2 border-primary p-12 bg-card shadow-editorial">
              <h3 className="text-3xl font-bold mb-4">
                No te pierdas ninguna edición
              </h3>
              <p className="text-muted-foreground mb-6">
                Visita el archivo completo para recorrer todas las tiras desde el principio
              </p>
              <button
                onClick={() => navigate('/archivo')}
                className="inline-block border-2 border-primary px-8 py-3 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Ver Archivo Completo
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
