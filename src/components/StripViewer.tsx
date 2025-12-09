import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ComicStrip {
  id: string;
  title: string | null;
  image_url: string;
  publish_date: string;
}

interface StripViewerProps {
  strips: ComicStrip[];
}

const StripViewer = ({ strips }: StripViewerProps) => {
  if (!strips || strips.length === 0) {
    return null;
  }

  const latestStrip = strips[0];

  const downloadAsPDF = async () => {
    try {
      toast.info("Generando PDF a ancho completo...");
      
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = latestStrip.image_url;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const maxWidth = pageWidth - (2 * margin);
      
      const aspectRatio = img.height / img.width;
      const imageHeight = maxWidth * aspectRatio;
      
      const finalHeight = Math.min(imageHeight, pageHeight - (2 * margin));
      const finalWidth = finalHeight / aspectRatio;
      
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(img, "PNG", x, y, finalWidth, finalHeight);
      
      const fileName = `${latestStrip.title || 'Porteria'}_${latestStrip.publish_date}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF descargado a ancho completo");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar PDF");
    }
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block border-2 border-primary px-6 py-2">
            <p className="text-xs tracking-[0.3em] uppercase font-medium">
              Última edición
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {new Date(latestStrip.publish_date).toLocaleDateString('es-ES', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric' 
            })}
          </h2>
          {latestStrip.title && (
            <p className="text-lg text-muted-foreground italic">{latestStrip.title}</p>
          )}
        </div>

        {/* Comic strip */}
        <div className="relative bg-card border-2 border-primary p-4 md:p-8 shadow-editorial">
          <img
            src={latestStrip.image_url}
            alt={`Tira cómica del ${latestStrip.publish_date}`}
            className="w-full h-auto"
          />
        </div>

        {/* Download Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={downloadAsPDF}
            size="lg"
            className="gap-2 shadow-editorial"
          >
            <Download className="h-5 w-5" />
            Descargar PDF a ancho completo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StripViewer;
