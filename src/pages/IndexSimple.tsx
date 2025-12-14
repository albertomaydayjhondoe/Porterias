import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  console.log("Index component rendering...");
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("Index component mounted");
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p>Cargando Daily Paper Comics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Daily Paper Comics
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Bienvenido a tu blog de tiras cómicas diarias
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Tira del Día</h3>
              <p className="text-gray-600">Descubre la tira cómica más reciente</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Archivo</h3>
              <p className="text-gray-600">Explora todas las tiras anteriores</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Sobre el autor</h3>
              <p className="text-gray-600">Conoce más sobre el creador</p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">¡Aplicación funcionando!</h2>
            <p className="text-gray-700">
              La aplicación se ha cargado correctamente. Todas las funciones están operativas.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Index;