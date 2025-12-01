import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ComicStrip {
  id: string;
  title: string | null;
  image_url: string;
  publish_date: string;
}

const Archive = () => {
  const navigate = useNavigate();
  const [strips, setStrips] = useState<ComicStrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

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
    } catch (error: any) {
      toast.error("Error al cargar tiras");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group strips by month
  const stripsByMonth = strips.reduce((acc, strip) => {
    const monthKey = new Date(strip.publish_date).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(strip);
    return acc;
  }, {} as Record<string, ComicStrip[]>);

  const months = Object.keys(stripsByMonth);

  const filteredStrips = selectedMonth === "all" 
    ? strips 
    : stripsByMonth[selectedMonth] || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block border-2 border-primary px-6 py-2 mb-4">
              <p className="text-xs tracking-[0.3em] uppercase font-medium">
                Archivo Histórico
              </p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Todas las Ediciones
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora el catálogo completo de tiras desde el primer día
            </p>
          </div>

          {/* Month filter */}
          {months.length > 0 && (
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedMonth === "all" ? "default" : "outline"}
                onClick={() => setSelectedMonth("all")}
                className="border-2 border-primary"
              >
                Todas
              </Button>
              {months.map((month) => (
                <Button
                  key={month}
                  variant={selectedMonth === month ? "default" : "outline"}
                  onClick={() => setSelectedMonth(month)}
                  className="border-2 border-primary capitalize"
                >
                  {month}
                </Button>
              ))}
            </div>
          )}

          {/* Grid of strips */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStrips.map((strip) => (
              <button
                key={strip.id}
                onClick={() => navigate(`/`)}
                className="group text-left"
              >
                <div className="border-2 border-primary bg-card overflow-hidden shadow-newspaper hover:shadow-editorial transition-all">
                  <img
                    src={strip.image_url}
                    alt={strip.title || `Tira del ${strip.publish_date}`}
                    className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                  <div className="p-6 border-t-2 border-primary">
                    <p className="text-lg font-bold mb-2">
                      {new Date(strip.publish_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {strip.title && (
                      <p className="text-sm text-muted-foreground italic">
                        {strip.title}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filteredStrips.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                {selectedMonth === "all" 
                  ? "No hay tiras disponibles aún" 
                  : "No hay tiras disponibles para este mes"}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Archive;
