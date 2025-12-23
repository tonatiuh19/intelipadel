import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import {
  Calendar,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClubs } from "@/store/slices/clubsSlice";
import { Club } from "@shared/types";

type BookingStep = "club" | "datetime" | "confirm" | "success";

interface BookingData {
  club: Club | null;
  date: Date | null;
  time: string | null;
  duration: number;
}

export default function Booking() {
  const dispatch = useAppDispatch();
  const { clubs, loading } = useAppSelector((state) => state.clubs);

  const [step, setStep] = useState<BookingStep>("club");
  const [bookingData, setBookingData] = useState<BookingData>({
    club: null,
    date: null,
    time: null,
    duration: 60,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  const handleSelectClub = (club: Club) => {
    setBookingData({ ...bookingData, club });
    setStep("datetime");
  };

  const handleSelectDateTime = (date: Date, time: string) => {
    setBookingData({ ...bookingData, date, time });
    setStep("confirm");
  };

  const handleConfirmBooking = () => {
    if (bookingData.club && bookingData.date && bookingData.time) {
      setStep("success");
      setTimeout(() => {
        setStep("club");
        setBookingData({ club: null, date: null, time: null, duration: 60 });
      }, 3000);
    }
  };

  const goBack = () => {
    if (step === "datetime") {
      setStep("club");
      setBookingData({ ...bookingData, date: null, time: null });
    } else if (step === "confirm") {
      setStep("datetime");
      setBookingData({ ...bookingData, date: null, time: null });
    }
  };

  const getProgress = () => {
    if (step === "club") return 33;
    if (step === "datetime") return 66;
    if (step === "confirm") return 99;
    return 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary/5 to-white">
      <Header />

      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress indicator */}
          {step !== "success" && (
            <div className="mb-12 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-secondary mb-2">
                    {step === "club" && "Elige Tu Club"}
                    {step === "datetime" && "Selecciona Hora"}
                    {step === "confirm" && "Confirma Tu Reserva"}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {step === "club" && "Encuentra el club perfecto para ti"}
                    {step === "datetime" && "Escoge la fecha y hora ideal"}
                    {step === "confirm" && "Revisa los detalles de tu reserva"}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-primary">
                    {step === "club" && "Paso 1 de 3"}
                    {step === "datetime" && "Paso 2 de 3"}
                    {step === "confirm" && "Paso 3 de 3"}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Step 1: Club Selection */}
          {step === "club" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club, idx) => (
                  <div
                    key={club.id}
                    className="group cursor-pointer animate-scale-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => handleSelectClub(club)}
                  >
                    <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                      {/* Club Image */}
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img
                          src={club.image_url}
                          alt={club.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Rating Badge */}
                        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-sm">
                            {club.rating}
                          </span>
                        </div>

                        {/* Featured Badge */}
                        {club.featured && (
                          <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Destacado
                          </div>
                        )}
                      </div>

                      {/* Club Info */}
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-secondary mb-2 group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>
                            {club.city}, {club.state}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {club.description}
                        </p>

                        {/* Amenities Preview */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {club.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1"
                            >
                              {amenity}
                            </span>
                          ))}
                          {club.amenities.length > 3 && (
                            <span className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1">
                              +{club.amenities.length - 3} más
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Precio
                            </p>
                            <p className="font-bold text-primary">
                              ${club.price_per_hour}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Canchas
                            </p>
                            <p className="font-bold text-secondary">
                              {club.court_count || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Reseñas
                            </p>
                            <p className="font-bold text-secondary">
                              {club.review_count}
                            </p>
                          </div>
                        </div>

                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                          Seleccionar Club
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === "datetime" && bookingData.club && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-border">
                {/* Club Summary */}
                <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={bookingData.club.image_url}
                        alt={bookingData.club.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-secondary">
                        {bookingData.club.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {bookingData.club.city}, {bookingData.club.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-8">
                  <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Selecciona una Fecha
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const date = addDays(new Date(), dayOffset);
                      const isSelected =
                        bookingData.date &&
                        format(bookingData.date, "yyyy-MM-dd") ===
                          format(date, "yyyy-MM-dd");
                      return (
                        <button
                          key={dayOffset}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg text-center font-semibold transition-all transform hover:scale-105 ${
                            isSelected
                              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg scale-105"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          }`}
                        >
                          <div className="text-xs uppercase tracking-wide">
                            {format(date, "EEE", { locale: es })}
                          </div>
                          <div className="text-lg mt-1">
                            {format(date, "dd")}
                          </div>
                          <div className="text-xs opacity-75">
                            {format(date, "MMM", { locale: es })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="mb-8">
                  <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Selecciona una Hora
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[
                      "08:00",
                      "09:30",
                      "11:00",
                      "12:30",
                      "14:00",
                      "15:30",
                      "17:00",
                      "18:30",
                      "20:00",
                      "21:30",
                    ].map((time) => (
                      <button
                        key={time}
                        onClick={() => handleSelectDateTime(selectedDate, time)}
                        className={`p-3 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                          bookingData.time === time
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg scale-105"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Selecciona tu horario preferido
                  </p>
                </div>

                {/* Duration & Price */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 mb-8 border border-primary/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-secondary mb-2 block">
                        Duración de la Reserva
                      </label>
                      <select
                        value={bookingData.duration}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            duration: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-primary rounded-lg font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value={60}>1 Hora</option>
                        <option value={90}>1.5 Horas</option>
                        <option value={120}>2 Horas</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary mb-2">
                        Precio Total
                      </p>
                      <div className="text-3xl font-black text-primary">
                        $
                        {(
                          bookingData.club.price_per_hour *
                          (bookingData.duration / 60)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={goBack}
                    className="flex-1 py-6 text-base font-bold"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 py-6 text-base font-bold bg-primary hover:bg-primary/90"
                    onClick={handleSelectDateTime}
                    disabled={!bookingData.date || !bookingData.time}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirm" &&
            bookingData.club &&
            bookingData.date &&
            bookingData.time && (
              <div className="animate-fade-in">
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-border">
                  <h2 className="text-3xl font-bold text-secondary mb-8">
                    Resumen de Tu Reserva
                  </h2>

                  {/* Booking Details Card */}
                  <div className="space-y-6 mb-8">
                    {/* Club */}
                    <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-l-4 border-primary">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                        Club Seleccionado
                      </p>
                      <h3 className="text-2xl font-bold text-secondary mb-2">
                        {bookingData.club.name}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {bookingData.club.city}, {bookingData.club.state}
                      </p>
                    </div>

                    {/* Date & Time */}
                    <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-l-4 border-primary">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                        Fecha y Hora
                      </p>
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Fecha
                          </p>
                          <p className="text-xl font-bold text-secondary">
                            {format(
                              bookingData.date,
                              "dd 'de' MMMM 'de' yyyy",
                              {
                                locale: es,
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Hora
                          </p>
                          <p className="text-xl font-bold text-secondary">
                            {bookingData.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Duration & Price */}
                    <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-l-4 border-primary">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                        Detalles de Precio
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Duración
                          </p>
                          <p className="text-lg font-bold text-secondary">
                            {bookingData.duration} min
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Tarifa Horaria
                          </p>
                          <p className="text-lg font-bold text-secondary">
                            ${bookingData.club.price_per_hour}/hr
                          </p>
                        </div>
                        <div className="border-l-2 border-primary/30 pl-4">
                          <p className="text-sm text-muted-foreground mb-1">
                            Total
                          </p>
                          <p className="text-2xl font-black text-primary">
                            $
                            {(
                              bookingData.club.price_per_hour *
                              (bookingData.duration / 60)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success Info */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900 text-lg mb-1">
                          ¡Tu cancha está reservada!
                        </p>
                        <p className="text-sm text-green-800">
                          Recibirás un correo de confirmación con todos los
                          detalles de tu reserva en los próximos minutos.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="flex-1 py-6 text-base font-bold"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 py-6 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={handleConfirmBooking}
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Confirmar Reserva
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Success Screen */}
          {step === "success" && (
            <div className="animate-scale-in flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Check className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-black text-secondary mb-4">
                  ¡Reserva Confirmada!
                </h2>
                <p className="text-xl text-muted-foreground mb-2">
                  Tu cancha de padel está lista
                </p>
                <p className="text-muted-foreground">
                  Redirigiendo a la página principal...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
