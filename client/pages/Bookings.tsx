import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  X,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBookings,
  cancelBooking,
  requestInvoice,
} from "@/store/slices/bookingsSlice";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Bookings() {
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector(
    (state) => state.bookings,
  );
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [privateClasses, setPrivateClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchBookings(user.id));
      // Fetch event registrations
      fetchEventRegistrations();
      // Fetch private classes
      fetchPrivateClasses();
    }
  }, [dispatch, user]);

  const fetchEventRegistrations = async () => {
    if (!user?.id) return;

    try {
      setLoadingEvents(true);
      const response = await fetch(`/api/users/${user.id}/event-registrations`);
      const data = await response.json();

      if (data.success) {
        setEventRegistrations(data.data);
      }
    } catch (error) {
      console.error("Error fetching event registrations:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchPrivateClasses = async () => {
    if (!user?.id) return;

    try {
      setLoadingClasses(true);
      const response = await fetch(`/api/users/${user.id}/private-classes`);
      const data = await response.json();

      if (data.success) {
        setPrivateClasses(data.data);
      }
    } catch (error) {
      console.error("Error fetching private classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleCancelClick = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedBookingId && user?.id) {
      await dispatch(
        cancelBooking({
          bookingId: selectedBookingId,
          userId: user.id,
          cancellationReason: "Cancelled by user",
        }),
      );
      setCancelDialogOpen(false);
      setSelectedBookingId(null);
    }
  };

  const handleRequestInvoice = async (bookingId: number) => {
    if (user?.id) {
      const result = await dispatch(
        requestInvoice({ bookingId, userId: user.id }),
      );

      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Solicitud enviada",
          description:
            "El club ha sido notificado y se pondrá en contacto contigo para solicitar los detalles necesarios para tu factura.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Error",
          description:
            "No se pudo enviar la solicitud. Por favor intenta de nuevo.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Confirmada", className: "bg-green-500" },
      pending: { label: "Pendiente", className: "bg-yellow-500" },
      completed: { label: "Completada", className: "bg-blue-500" },
      cancelled: { label: "Cancelada", className: "bg-red-500" },
      no_show: { label: "No presentó", className: "bg-gray-500" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={cn("text-white", config.className)}>
        {config.label}
      </Badge>
    );
  };

  const canCancel = (booking: any) => {
    if (booking.status === "cancelled" || booking.status === "completed") {
      return false;
    }
    // Extract date part only from booking_date (which comes as ISO string)
    const dateStr = booking.booking_date.split("T")[0];
    const bookingDateTime = new Date(`${dateStr} ${booking.start_time}`);
    return bookingDateTime > new Date();
  };

  const canRequestInvoice = (booking: any) => {
    return booking.payment_status === "paid" && booking.factura_requested !== 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Mis Reservas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ver y gestionar tus reservaciones
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando reservas...</p>
          </div>
        )}

        {error && (
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => user?.id && dispatch(fetchBookings(user.id))}
            >
              Intentar de nuevo
            </Button>
          </Card>
        )}

        {!loading &&
          !error &&
          bookings.length === 0 &&
          eventRegistrations.length === 0 &&
          privateClasses.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No tienes reservas, clases ni inscripciones
              </h3>
              <p className="text-muted-foreground mb-6">
                ¡Haz tu primera reserva, inscríbete a un evento o agenda una
                clase privada!
              </p>
              <Link to="/booking">
                <Button size="lg">Nueva Reserva</Button>
              </Link>
            </Card>
          )}

        {/* Event Registrations Section */}
        {!loadingEvents && eventRegistrations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="h-8 w-8 text-orange-500" />
              <h2 className="text-2xl font-bold">
                Mis Inscripciones a Eventos
              </h2>
            </div>
            <div className="grid gap-6">
              {eventRegistrations.map((registration: any, index: number) => {
                const eventDate = new Date(registration.event_date);
                const isPastEvent = eventDate < new Date();

                return (
                  <Card
                    key={registration.registration_id}
                    className={cn(
                      "overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-orange-500",
                      "animate-in fade-in slide-in-from-bottom-4",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Trophy className="h-5 w-5 text-orange-500" />
                            <h3 className="text-xl font-bold">
                              {registration.title}
                            </h3>
                            <Badge
                              variant={isPastEvent ? "secondary" : "default"}
                              className={cn(
                                isPastEvent
                                  ? "bg-gray-500 text-white"
                                  : "bg-orange-500 text-white",
                              )}
                            >
                              {isPastEvent ? "Finalizado" : "Próximo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {registration.event_type === "tournament" &&
                              "Torneo"}
                            {registration.event_type === "league" && "Liga"}
                            {registration.event_type === "training" &&
                              "Entrenamiento"}
                            {registration.event_type === "social" && "Social"}
                            {registration.event_type === "exhibition" &&
                              "Exhibición"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-lg border-orange-500 text-orange-600"
                        >
                          ${Number(registration.registration_fee).toFixed(2)}{" "}
                          MXN
                        </Badge>
                      </div>

                      {registration.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {registration.description}
                        </p>
                      )}

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Fecha
                            </p>
                            <p className="font-semibold">
                              {format(eventDate, "dd MMM yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Horario
                            </p>
                            <p className="font-semibold">
                              {registration.start_time} -{" "}
                              {registration.end_time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Club
                            </p>
                            <p className="font-semibold">
                              {registration.club_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {registration.prize_pool > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
                          <p className="text-sm">
                            <span className="font-semibold text-orange-600">
                              Premio:
                            </span>{" "}
                            ${Number(registration.prize_pool).toFixed(2)} MXN
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Inscrito:{" "}
                            {format(
                              new Date(registration.registration_date),
                              "dd MMM yyyy",
                              {
                                locale: es,
                              },
                            )}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600"
                          >
                            {registration.payment_status === "paid"
                              ? "Pagado"
                              : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Private Classes Section */}
        {!loadingClasses && privateClasses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold">Mis Clases Privadas</h2>
            </div>
            <div className="grid gap-6">
              {privateClasses.map((privateClass: any, index: number) => {
                const classDate = new Date(privateClass.class_date);
                const isPastClass = classDate < new Date();

                return (
                  <Card
                    key={privateClass.id}
                    className={cn(
                      "overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-green-600",
                      "animate-in fade-in slide-in-from-bottom-4",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            <h3 className="text-xl font-bold">
                              Clase con {privateClass.instructor_name}
                            </h3>
                            <Badge
                              variant={isPastClass ? "secondary" : "default"}
                              className={cn(
                                isPastClass
                                  ? "bg-gray-500 text-white"
                                  : "bg-green-600 text-white",
                              )}
                            >
                              {isPastClass ? "Completada" : "Próxima"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Clase{" "}
                            {privateClass.class_type === "individual"
                              ? "Individual"
                              : "Grupal"}{" "}
                            • {privateClass.number_of_students} estudiante
                            {privateClass.number_of_students > 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-lg border-green-600 text-green-600"
                        >
                          ${Number(privateClass.total_price).toFixed(2)} MXN
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-600/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Fecha
                            </p>
                            <p className="font-semibold">
                              {format(classDate, "dd MMM yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-600/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Horario
                            </p>
                            <p className="font-semibold">
                              {privateClass.start_time.slice(0, 5)} -{" "}
                              {privateClass.end_time.slice(0, 5)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-600/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Cancha
                            </p>
                            <p className="font-semibold">
                              {privateClass.court_name || "Por asignar"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {privateClass.notes && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                          <p className="text-sm">
                            <span className="font-semibold text-green-600">
                              Notas:
                            </span>{" "}
                            {privateClass.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Reserva: #{privateClass.booking_number}</span>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600"
                          >
                            {privateClass.payment_status === "paid"
                              ? "Pagado"
                              : "Pendiente"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              privateClass.status === "confirmed" &&
                                "border-green-500 text-green-600",
                              privateClass.status === "completed" &&
                                "border-blue-500 text-blue-600",
                              privateClass.status === "cancelled" &&
                                "border-red-500 text-red-600",
                            )}
                          >
                            {privateClass.status === "confirmed" &&
                              "Confirmada"}
                            {privateClass.status === "completed" &&
                              "Completada"}
                            {privateClass.status === "cancelled" && "Cancelada"}
                            {privateClass.status === "pending" && "Pendiente"}
                            {privateClass.status === "rescheduled" &&
                              "Reprogramada"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Court Bookings Section */}
        {!loading && !error && bookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Reservas de Canchas</h2>
            <div className="grid gap-6">
              {bookings.map((booking: any, index: number) => (
                <Card
                  key={booking.id}
                  className={cn(
                    "overflow-hidden transition-all duration-300 hover:shadow-lg",
                    "animate-in fade-in slide-in-from-bottom-4",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">
                            {booking.club_name}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reserva #{booking.booking_number}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        ${Number(booking.total_price).toFixed(2)} MXN
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha</p>
                          <p className="font-semibold">
                            {format(
                              new Date(booking.booking_date),
                              "dd 'de' MMMM",
                              { locale: es },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Horario
                          </p>
                          <p className="font-semibold">
                            {booking.start_time.slice(0, 5)} -{" "}
                            {booking.end_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Cancha
                          </p>
                          <p className="font-semibold">{booking.court_name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {canCancel(booking) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(booking.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar Reserva
                        </Button>
                      )}

                      {canRequestInvoice(booking) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestInvoice(booking.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Solicitar Factura
                        </Button>
                      )}

                      {booking.factura_requested === 1 && (
                        <Badge variant="secondary" className="px-3 py-1">
                          <FileText className="h-3 w-3 mr-1" />
                          Factura solicitada
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reserva será cancelada y el
              horario quedará disponible para otros usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener reserva</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Sí, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
