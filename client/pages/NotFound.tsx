import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-black text-primary mb-4">404</h1>
          <h2 className="text-4xl font-bold text-secondary mb-4">Página No Encontrada</h2>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          ¡Ups! La página que buscas no existe. Volvamos a la reserva de tu cancha de padel perfecta.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            Volver al Inicio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
