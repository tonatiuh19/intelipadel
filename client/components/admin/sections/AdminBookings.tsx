import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  List,
  Calendar,
  Plus,
  GraduationCap,
} from "lucide-react";
import ManualBookingModal from "@/components/admin/ManualBookingModal";
import ManualPrivateClassModal from "@/components/admin/ManualPrivateClassModal";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAdminBookings } from "@/store/slices/adminBookingsSlice";
import BookingCalendar from "@/components/admin/BookingCalendar";

export default function AdminBookings() {
  const dispatch = useAppDispatch();
  const { bookings, isLoading } = useAppSelector(
    (state) => state.adminBookings,
  );
  const [privateClasses, setPrivateClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showManualBookingModal, setShowManualBookingModal] = useState(false);
  const [showManualClassModal, setShowManualClassModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Fetch regular bookings
  useEffect(() => {
    const params: any = {};
    if (startDate) params.startDate = format(startDate, "yyyy-MM-dd");
    if (endDate) params.endDate = format(endDate, "yyyy-MM-dd");
    if (statusFilter !== "all") params.status = statusFilter;

    dispatch(getAdminBookings(params));
  }, [dispatch, startDate, endDate, statusFilter]);

  // Fetch private classes
  useEffect(() => {
    const fetchPrivateClasses = async () => {
      setLoadingClasses(true);
      try {
        const adminSessionToken = localStorage.getItem("adminSessionToken");
        const params = new URLSearchParams();
        if (startDate)
          params.append("startDate", format(startDate, "yyyy-MM-dd"));
        if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"));
        if (statusFilter !== "all") params.append("status", statusFilter);

        const response = await fetch(
          `/api/admin/private-classes?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${adminSessionToken}`,
            },
          },
        );
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

    fetchPrivateClasses();
  }, [startDate, endDate, statusFilter]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const adminSessionToken = localStorage.getItem("adminSessionToken");
        const params = new URLSearchParams();
        if (startDate)
          params.append("startDate", format(startDate, "yyyy-MM-dd"));
        if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"));

        const response = await fetch(`/api/admin/events?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${adminSessionToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [startDate, endDate]);

  // Combine bookings, private classes, and events for calendar view
  const combinedBookings = [
    ...bookings.map((b) => ({ ...b, booking_type: "booking" as const })),
    ...privateClasses.map((c) => ({
      id: c.id,
      booking_date: c.class_date,
      start_time: c.start_time,
      end_time: c.end_time,
      status: c.status,
      payment_status: c.status,
      total_price: c.total_price,
      user_name: c.user_name,
      user_email: c.user_email,
      user_phone: c.user_phone,
      club_name: c.club_name,
      court_name: c.court_name,
      booking_type: "class" as const,
      class_type: c.class_type,
      instructor_name: c.instructor_name,
    })),
    ...events.map((e) => ({
      id: e.id,
      booking_date: e.event_date,
      start_time: e.start_time,
      end_time: e.end_time,
      status: e.status,
      payment_status: e.status,
      total_price: e.registration_fee,
      user_name: `${e.current_participants} participantes`,
      user_email: "",
      user_phone: "",
      club_name: e.club_name,
      court_name: e.courts_used
        ? `${e.courts_used.length} canchas`
        : "Varias canchas",
      booking_type: "event" as const,
      event_title: e.title,
      event_type: e.event_type,
    })),
  ];

  const filteredBookings = combinedBookings.filter((booking) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.user_name.toLowerCase().includes(search) ||
      booking.user_email.toLowerCase().includes(search) ||
      booking.club_name.toLowerCase().includes(search) ||
      booking.court_name.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Reservaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Ve y administra todas las reservaciones de tus clubes
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowManualBookingModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Reserva
          </Button>
          <Button
            onClick={() => setShowManualClassModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Crear Clase
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            className={
              viewMode === "calendar"
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : ""
            }
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : ""
            }
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Filters */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar reservaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Fecha Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "PPP")
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>Fecha Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <BookingCalendar
          bookings={filteredBookings}
          onBookingClick={(booking) => setSelectedBooking(booking)}
        />
      )}

      {/* Bookings List */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Reservaciones ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando reservaciones...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron reservaciones
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.user_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.user_email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.user_phone}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.club_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.court_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : booking.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="font-bold text-blue-600">
                          ${booking.total_price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.booking_type === "class"
                ? "Detalles de la Clase"
                : selectedBooking?.booking_type === "event"
                  ? "Detalles del Evento"
                  : "Detalles de la Reservación"}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking?.booking_type === "class"
                ? "Información completa de la clase privada"
                : selectedBooking?.booking_type === "event"
                  ? "Información completa del evento"
                  : "Información completa de la reservación"}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Cliente</Label>
                  <p className="font-semibold">{selectedBooking.user_name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.user_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.user_phone}
                  </p>
                </div>

                {/* Show Instructor info for classes */}
                {selectedBooking.booking_type === "class" && (
                  <div>
                    <Label className="text-gray-500">Instructor</Label>
                    <p className="font-semibold">
                      {selectedBooking.instructor_name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tipo:{" "}
                      {selectedBooking.class_type === "individual"
                        ? "Individual"
                        : "Grupal"}
                    </p>
                  </div>
                )}

                {/* Show Event info for events */}
                {selectedBooking.booking_type === "event" && (
                  <div>
                    <Label className="text-gray-500">Evento</Label>
                    <p className="font-semibold">
                      {selectedBooking.event_title || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tipo: {selectedBooking.event_type || "N/A"}
                    </p>
                  </div>
                )}

                {/* Show Club and Court for regular bookings */}
                {selectedBooking.booking_type !== "class" &&
                  selectedBooking.booking_type !== "event" && (
                    <div>
                      <Label className="text-gray-500">Club y Cancha</Label>
                      <p className="font-semibold">
                        {selectedBooking.club_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.court_name}
                      </p>
                    </div>
                  )}

                {/* Always show club and court for classes and events in separate section */}
                {(selectedBooking.booking_type === "class" ||
                  selectedBooking.booking_type === "event") && (
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Club</Label>
                      <p className="font-semibold">
                        {selectedBooking.club_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Cancha</Label>
                      <p className="font-semibold">
                        {selectedBooking.court_name}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-gray-500">Fecha y Hora</Label>
                  <p className="font-semibold">
                    {new Date(selectedBooking.booking_date).toLocaleDateString(
                      "es-MX",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-500">Estado y Precio</Label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedBooking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedBooking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : selectedBooking.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <p className="font-bold text-orange-600 text-lg mt-1">
                    ${selectedBooking.total_price}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Booking Modal */}
      <ManualBookingModal
        open={showManualBookingModal}
        onClose={() => {
          setShowManualBookingModal(false);
          setSelectedPlayer(null);
        }}
        userId={selectedPlayer?.id}
        userName={selectedPlayer?.name}
        onSuccess={() => {
          setShowManualBookingModal(false);
          setSelectedPlayer(null);
          dispatch(getAdminBookings({}));
        }}
      />

      {/* Manual Private Class Modal */}
      <ManualPrivateClassModal
        open={showManualClassModal}
        onClose={() => {
          setShowManualClassModal(false);
          setSelectedPlayer(null);
        }}
        userId={selectedPlayer?.id}
        userName={selectedPlayer?.name}
        onSuccess={() => {
          setShowManualClassModal(false);
          setSelectedPlayer(null);
          // Refresh the calendar data
          dispatch(getAdminBookings({}));
        }}
      />
    </div>
  );
}
