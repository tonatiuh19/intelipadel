import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClubs } from "@/store/slices/clubsSlice";
import { motion } from "framer-motion";

export default function Clubs() {
  const dispatch = useAppDispatch();
  const { clubs, loading, error } = useAppSelector((state) => state.clubs);

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  // Format duration for display in Mexican Spanish
  const formatDuration = (minutes: number = 60) => {
    if (minutes === 60) return "hora";
    if (minutes === 90) return "hora y media";
    if (minutes === 120) return "2 hrs";
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Explorar Todos los Clubes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre clubes de padel premium en tu área
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando clubes...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => dispatch(fetchClubs())} className="mt-4">
              Intentar de nuevo
            </Button>
          </div>
        )}

        {!loading && !error && clubs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, idx) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    <img
                      src={club.image_url}
                      alt={club.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {club.has_subscriptions && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-lg">
                        <Crown className="h-3 w-3 mr-1" />
                        Suscripciones
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-secondary mb-2">
                      {club.name}
                    </h3>
                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{club.city}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{club.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({club.review_count} reseñas)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Precio</p>
                        <p className="text-lg font-bold text-primary">
                          ${club.price_per_hour}/
                          {formatDuration(club.default_booking_duration)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Canchas</p>
                        <p className="text-lg font-bold text-secondary">
                          {club.court_count}
                        </p>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link to="/booking">
                        Reservar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && clubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No hay clubes disponibles
            </p>
            <Button asChild size="lg">
              <Link to="/">
                Volver al Inicio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
