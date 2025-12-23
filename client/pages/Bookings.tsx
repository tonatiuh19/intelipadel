import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings } from "@/store/slices/bookingsSlice";
import { motion } from "framer-motion";

export default function Bookings() {
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector(
    (state) => state.bookings,
  );

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Mis Reservas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ver y gestionar tus reservaciones
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando reservas...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => dispatch(fetchBookings())} className="mt-4">
              Intentar de nuevo
            </Button>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-secondary mb-1">
                        {booking.clubName}
                      </h3>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {booking.status === "confirmed"
                          ? "Confirmado"
                          : booking.status === "cancelled"
                            ? "Cancelado"
                            : "Pendiente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{booking.date}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{booking.time}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Duración: {booking.duration} minutos
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No tienes reservas todavía
            </p>
            <Button asChild size="lg">
              <Link to="/booking">
                Hacer una Reserva
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
