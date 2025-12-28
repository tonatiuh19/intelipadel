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
} from "lucide-react";
import ManualBookingModal from "@/components/admin/ManualBookingModal";
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
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showManualBookingModal, setShowManualBookingModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const params: any = {};
    if (startDate) params.startDate = format(startDate, "yyyy-MM-dd");
    if (endDate) params.endDate = format(endDate, "yyyy-MM-dd");
    if (statusFilter !== "all") params.status = statusFilter;

    dispatch(getAdminBookings(params));
  }, [dispatch, startDate, endDate, statusFilter]);

  const filteredBookings = bookings.filter((booking) => {
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
          bookings={bookings}
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
                          €{booking.total_price}
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
            <DialogTitle>Detalles de la Reservación</DialogTitle>
            <DialogDescription>
              Información completa de la reservación
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

                <div>
                  <Label className="text-gray-500">Club y Cancha</Label>
                  <p className="font-semibold">{selectedBooking.club_name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.court_name}
                  </p>
                </div>

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
                    €{selectedBooking.total_price}
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
    </div>
  );
}
