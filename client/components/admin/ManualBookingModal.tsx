import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchAvailability } from "@/store/slices/availabilitySlice";
import CourtTimeSlotSelector from "@/components/booking/CourtTimeSlotSelector";
import type { AvailabilityData } from "@/store/slices/availabilitySlice";
import { createManualBooking } from "@/store/slices/adminBookingsSlice";
import { getAdminCourts } from "@/store/slices/adminCourtsSlice";
import { getAdminPlayers } from "@/store/slices/adminPlayersSlice";

interface ManualBookingModalProps {
  open: boolean;
  onClose: () => void;
  userId?: number;
  userName?: string;
  onSuccess: () => void;
}

const bookingSchema = Yup.object({
  user_id: Yup.number().required("Selecciona un jugador"),
  court_id: Yup.number().required("Selecciona una cancha y horario"),
  booking_date: Yup.date().required("Selecciona una fecha"),
  start_time: Yup.string().required("Selecciona un horario"),
  end_time: Yup.string().required("Selecciona un horario"),
  total_price: Yup.number()
    .positive("El precio debe ser mayor a 0")
    .required("Ingresa el precio"),
  notes: Yup.string(),
});

export default function ManualBookingModal({
  open,
  onClose,
  userId,
  userName,
  onSuccess,
}: ManualBookingModalProps) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.adminAuth);
  const { data: availability, loading: loadingAvailability } = useAppSelector(
    (state) => state.availability,
  );
  const { courts, isLoading: loadingCourts } = useAppSelector(
    (state) => state.adminCourts,
  );
  const { players, isLoading: loadingPlayers } = useAppSelector(
    (state) => state.adminPlayers,
  );
  const { isSubmitting } = useAppSelector((state) => state.adminBookings);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCourtObj, setSelectedCourtObj] = useState<any>(null);
  const [duration, setDuration] = useState<number>(60);

  // Fetch courts and players when modal opens
  useEffect(() => {
    if (open && admin?.club_id) {
      dispatch(getAdminCourts());
      if (!userId) {
        dispatch(getAdminPlayers());
      }
    }
  }, [open, admin?.club_id, userId, dispatch, dispatch]);

  const formik = useFormik({
    initialValues: {
      user_id: userId?.toString() || "",
      court_id: "",
      booking_date: new Date(),
      start_time: "08:00",
      end_time: "09:00",
      total_price: 0,
      notes: "",
    },
    validationSchema: bookingSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(
          createManualBooking({
            user_id: parseInt(values.user_id),
            club_id: admin!.club_id!,
            court_id: parseInt(values.court_id),
            booking_date: format(values.booking_date, "yyyy-MM-dd"),
            start_time: values.start_time,
            end_time: values.end_time,
            total_price: values.total_price,
            notes: values.notes || null,
          }),
        ).unwrap();

        toast({
          title: "Reserva creada",
          description: "La reserva manual se creó exitosamente",
        });

        formik.resetForm();
        onSuccess();
        onClose();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error || "Error al crear la reserva manual",
          variant: "destructive",
        });
      }
    },
  });

  // Fetch availability when date changes
  useEffect(() => {
    if (formik.values.booking_date && admin?.club_id) {
      const startDate = format(formik.values.booking_date, "yyyy-MM-dd");
      const endDate = format(
        addDays(formik.values.booking_date, 1),
        "yyyy-MM-dd",
      );

      console.log("🔍 Fetching availability:", {
        clubId: admin.club_id,
        startDate,
        endDate,
      });

      dispatch(
        fetchAvailability({
          clubId: admin.club_id,
          startDate,
          endDate,
        }),
      );
    }
  }, [formik.values.booking_date, admin?.club_id, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {userName
              ? `Crear Reserva Manual para ${userName}`
              : "Crear Reserva Manual"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Player Selection - Only show if userId not provided */}
          {!userId && (
            <div className="space-y-2">
              <Label htmlFor="user_id">Jugador *</Label>
              <Select
                value={formik.values.user_id}
                onValueChange={(value) =>
                  formik.setFieldValue("user_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un jugador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} - {player.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.user_id && formik.errors.user_id && (
                <p className="text-sm text-red-600">{formik.errors.user_id}</p>
              )}
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="booking_date">Fecha *</Label>
            <Input
              id="booking_date"
              type="date"
              value={format(formik.values.booking_date, "yyyy-MM-dd")}
              onChange={(e) => {
                // Parse date string as local date to avoid timezone issues
                const date = parse(e.target.value, "yyyy-MM-dd", new Date());
                formik.setFieldValue("booking_date", date);
                // Reset time selection when date changes
                setSelectedTime("");
                setSelectedCourtObj(null);
              }}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full"
            />
            {formik.touched.booking_date && formik.errors.booking_date && (
              <p className="text-sm text-red-600">
                {formik.errors.booking_date as string}
              </p>
            )}
          </div>

          {/* Court and Time Selection */}
          {formik.values.booking_date && (
            <div className="space-y-2">
              <Label>Selecciona Cancha y Horario *</Label>
              <CourtTimeSlotSelector
                selectedDate={formik.values.booking_date}
                selectedTime={selectedTime}
                selectedCourt={selectedCourtObj}
                availability={availability}
                loading={loadingAvailability}
                onSelectTimeSlot={(court, time) => {
                  setSelectedTime(time);
                  setSelectedCourtObj(court);
                  formik.setFieldValue("court_id", court.id.toString());
                  formik.setFieldValue("start_time", time);

                  // Calculate end time based on duration
                  const [hour] = time.split(":");
                  const endHour = (parseInt(hour) + Math.floor(duration / 60))
                    .toString()
                    .padStart(2, "0");
                  formik.setFieldValue("end_time", `${endHour}:00`);
                }}
              />
              {formik.touched.court_id && formik.errors.court_id && (
                <p className="text-sm text-red-600">{formik.errors.court_id}</p>
              )}
              {formik.touched.start_time && formik.errors.start_time && (
                <p className="text-sm text-red-600">
                  {formik.errors.start_time}
                </p>
              )}
              {selectedCourtObj && selectedTime && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Seleccionado:</strong> {selectedCourtObj.name} -{" "}
                    {selectedTime} a {formik.values.end_time}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="total_price">Precio Total ($) *</Label>
            <Input
              id="total_price"
              type="number"
              step="0.01"
              {...formik.getFieldProps("total_price")}
            />
            {formik.touched.total_price && formik.errors.total_price && (
              <p className="text-sm text-red-600">
                {formik.errors.total_price}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...formik.getFieldProps("notes")}
              rows={3}
              placeholder="Notas adicionales sobre la reserva..."
            />
          </div>

          {/* Payment Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              <strong>💰 Pago Manual:</strong> Esta reserva se marcará como
              pagada manualmente por el administrador.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loadingCourts ||
                loadingPlayers ||
                !selectedCourtObj ||
                !selectedTime
              }
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSubmitting ? "Creando..." : "Crear Reserva"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
          {(!selectedCourtObj || !selectedTime) && (
            <p className="text-sm text-orange-600">
              * Debes seleccionar una cancha y horario antes de crear la reserva
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
