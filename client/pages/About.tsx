import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-secondary mb-4">Acerca de Intelipadel</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Aprende más sobre nuestra misión de revolucionar la reserva de canchas de padel. ¡Esta página está por venir!
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
}
