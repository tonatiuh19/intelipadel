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
import { Card } from "@/components/ui/card";
import { format, addDays, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchAvailability } from "@/store/slices/availabilitySlice";
import CourtTimeSlotSelector from "@/components/booking/CourtTimeSlotSelector";
import { getAdminPlayers } from "@/store/slices/adminPlayersSlice";
import {
  fetchInstructors,
  clearInstructors,
} from "@/store/slices/instructorsSlice";
import { GraduationCap } from "lucide-react";

interface Instructor {
  id: number;
  club_id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties?: string[]; // Array for public instructors API
  hourly_rate: number;
  avatar_url?: string;
  rating?: number;
  review_count?: number;
  is_active: boolean;
  availability?: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
}

interface ManualPrivateClassModalProps {
  open: boolean;
  onClose: () => void;
  userId?: number;
  userName?: string;
  onSuccess: () => void;
}

const classSchema = Yup.object({
  user_id: Yup.number().required("Selecciona un jugador"),
  instructor_id: Yup.number().required("Selecciona un instructor"),
  court_id: Yup.number().required("Selecciona una cancha y horario"),
  class_date: Yup.date().required("Selecciona una fecha"),
  start_time: Yup.string().required("Selecciona un horario"),
  end_time: Yup.string().required("Selecciona un horario"),
  class_type: Yup.string()
    .oneOf(["individual", "group"])
    .required("Selecciona el tipo de clase"),
  number_of_students: Yup.number()
    .min(1, "Debe haber al menos 1 estudiante")
    .required("Ingresa el número de estudiantes"),
  total_price: Yup.number()
    .positive("El precio debe ser mayor a 0")
    .required("Ingresa el precio"),
  notes: Yup.string(),
});

export default function ManualPrivateClassModal({
  open,
  onClose,
  userId,
  userName,
  onSuccess,
}: ManualPrivateClassModalProps) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.adminAuth);
  const { data: availability, loading: loadingAvailability } = useAppSelector(
    (state) => state.availability,
  );
  const { players, isLoading: loadingPlayers } = useAppSelector(
    (state) => state.adminPlayers,
  );
  const { instructors, loading: loadingInstructors } = useAppSelector(
    (state) => state.instructors,
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCourtObj, setSelectedCourtObj] = useState<any>(null);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      user_id: userId?.toString() || "",
      instructor_id: "",
      court_id: "",
      class_date: null as Date | null,
      start_time: "08:00",
      end_time: "09:00",
      class_type: "individual",
      number_of_students: 1,
      total_price: 0,
      notes: "",
    },
    validationSchema: classSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const adminSessionToken = localStorage.getItem("adminSessionToken");
        const response = await fetch("/api/admin/private-classes/manual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminSessionToken}`,
          },
          body: JSON.stringify({
            user_id: parseInt(values.user_id),
            instructor_id: parseInt(values.instructor_id),
            club_id: admin!.club_id!,
            court_id: parseInt(values.court_id),
            class_date: format(values.class_date, "yyyy-MM-dd"),
            start_time: values.start_time,
            end_time: values.end_time,
            class_type: values.class_type,
            number_of_students: values.number_of_students,
            total_price: values.total_price,
            notes: values.notes || null,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "Error al crear la clase");
        }

        toast({
          title: "Clase creada",
          description: "La clase privada se creó exitosamente",
        });

        onSuccess();
        onClose();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al crear la clase privada",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!open) {
      // Reset everything when modal closes
      formik.resetForm();
      setSelectedTime("");
      setSelectedCourtObj(null);
      setSelectedInstructor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Set userId when provided
  useEffect(() => {
    if (open && userId) {
      formik.setFieldValue("user_id", userId.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  // Fetch players when modal opens
  useEffect(() => {
    if (open && admin?.club_id && !userId) {
      dispatch(getAdminPlayers());
    }
  }, [open, admin?.club_id, userId, dispatch]);

  // Fetch instructors when date changes (with date filter)
  useEffect(() => {
    if (formik.values.class_date && admin?.club_id) {
      const dateStr = format(formik.values.class_date, "yyyy-MM-dd");
      dispatch(fetchInstructors({ clubId: admin.club_id, date: dateStr }));
    }
  }, [formik.values.class_date, admin?.club_id, dispatch]);

  // Clear instructors when modal closes
  useEffect(() => {
    if (!open) {
      dispatch(clearInstructors());
    }
  }, [open, dispatch]);

  // Fetch availability when date changes (needed before instructor selection)
  useEffect(() => {
    if (formik.values.class_date && admin?.club_id) {
      const startDate = format(formik.values.class_date, "yyyy-MM-dd");
      const endDate = format(
        addDays(formik.values.class_date, 1),
        "yyyy-MM-dd",
      );

      dispatch(
        fetchAvailability({
          clubId: admin.club_id,
          startDate,
          endDate,
        }),
      );
    }
  }, [formik.values.class_date, admin?.club_id, dispatch]);

  // Update price when instructor changes
  useEffect(() => {
    if (selectedInstructor) {
      const hourlyRate = selectedInstructor.hourly_rate || 0;
      formik.setFieldValue("total_price", hourlyRate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstructor]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            {userName
              ? `Crear Clase Privada para ${userName}`
              : "Crear Clase Privada Manual"}
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

          {/* Date Selection - MOVED BEFORE INSTRUCTOR */}
          <div className="space-y-2">
            <Label htmlFor="class_date">Fecha *</Label>
            <Input
              id="class_date"
              type="date"
              value={
                formik.values.class_date
                  ? format(formik.values.class_date, "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) => {
                if (e.target.value) {
                  const date = parse(e.target.value, "yyyy-MM-dd", new Date());
                  formik.setFieldValue("class_date", date);
                } else {
                  formik.setFieldValue("class_date", null);
                }
                // Reset instructor, time and court selection when date changes
                formik.setFieldValue("instructor_id", "");
                setSelectedInstructor(null);
                setSelectedTime("");
                setSelectedCourtObj(null);
              }}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full"
            />
            {formik.touched.class_date && formik.errors.class_date && (
              <p className="text-sm text-red-600">
                {formik.errors.class_date as string}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Selecciona primero la fecha para verificar disponibilidad de
              instructores
            </p>
          </div>

          {/* Instructor Selection */}
          <div className="space-y-2">
            <Label htmlFor="instructor_id">Instructor *</Label>
            {!formik.values.class_date ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Selecciona una fecha primero para ver instructores disponibles
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {loadingInstructors ? (
                  <p className="text-sm text-gray-500">
                    Cargando instructores...
                  </p>
                ) : instructors.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hay instructores disponibles
                  </p>
                ) : (
                  instructors.map((instructor) => (
                    <Card
                      key={instructor.id}
                      className={`p-4 cursor-pointer transition-all ${
                        formik.values.instructor_id === instructor.id.toString()
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-green-300 hover:shadow-sm"
                      }`}
                      onClick={() => {
                        formik.setFieldValue(
                          "instructor_id",
                          instructor.id.toString(),
                        );
                        setSelectedInstructor({ ...instructor });
                        // Reset time and court selection when instructor changes
                        setSelectedTime("");
                        setSelectedCourtObj(null);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-green-600" />
                            {instructor.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {instructor.bio || "Instructor de pádel"}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="text-green-600 font-semibold">
                              ${instructor.hourly_rate}/hora
                            </span>
                            {instructor.specialties &&
                              instructor.specialties.length > 0 && (
                                <span className="text-gray-500">
                                  • {instructor.specialties.join(", ")}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
            {formik.touched.instructor_id && formik.errors.instructor_id && (
              <p className="text-sm text-red-600">
                {formik.errors.instructor_id}
              </p>
            )}
          </div>

          {/* Class Type */}
          <div className="space-y-2">
            <Label htmlFor="class_type">Tipo de Clase *</Label>
            <Select
              value={formik.values.class_type}
              onValueChange={(value) => {
                formik.setFieldValue("class_type", value);
                if (value === "individual") {
                  formik.setFieldValue("number_of_students", 1);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="group">Grupal</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.class_type && formik.errors.class_type && (
              <p className="text-sm text-red-600">{formik.errors.class_type}</p>
            )}
          </div>

          {/* Number of Students */}
          {formik.values.class_type === "group" && (
            <div className="space-y-2">
              <Label htmlFor="number_of_students">
                Número de Estudiantes *
              </Label>
              <Input
                id="number_of_students"
                type="number"
                min="1"
                max="10"
                {...formik.getFieldProps("number_of_students")}
              />
              {formik.touched.number_of_students &&
                formik.errors.number_of_students && (
                  <p className="text-sm text-red-600">
                    {formik.errors.number_of_students}
                  </p>
                )}
            </div>
          )}

          {/* Court and Time Selection - Only show when instructor is selected */}
          {formik.values.class_date && formik.values.instructor_id && (
            <div className="space-y-2">
              <Label>
                Selecciona Hora y Cancha para Clase con{" "}
                {selectedInstructor?.name}
              </Label>
              <CourtTimeSlotSelector
                selectedDate={formik.values.class_date}
                selectedTime={selectedTime}
                selectedCourt={selectedCourtObj}
                availability={availability}
                loading={loadingAvailability}
                duration={60}
                calculatedPrice={null}
                onSelectTimeSlot={(court, time) => {
                  // Prevent default - don't submit, just update state
                  setSelectedTime(time);
                  setSelectedCourtObj(court);
                  formik.setFieldValue("court_id", court.id.toString());
                  formik.setFieldValue("start_time", time);

                  // Calculate end time (1 hour)
                  const [hour, minute] = time.split(":");
                  const endHour = (parseInt(hour) + 1)
                    .toString()
                    .padStart(2, "0");
                  formik.setFieldValue("end_time", `${endHour}:${minute}`);
                }}
                onClassSelect={(instructor, time, court) => {
                  // Prevent default - don't submit, just update state
                  if (court) {
                    setSelectedTime(time);
                    setSelectedCourtObj(court);
                    formik.setFieldValue("court_id", court.id.toString());
                    formik.setFieldValue("start_time", time);

                    // Calculate end time (1 hour)
                    const [hour, minute] = time.split(":");
                    const endHour = (parseInt(hour) + 1)
                      .toString()
                      .padStart(2, "0");
                    formik.setFieldValue("end_time", `${endHour}:${minute}`);
                  }
                }}
                selectedInstructor={
                  selectedInstructor
                    ? {
                        ...selectedInstructor,
                        specialties: selectedInstructor.specialties || [],
                      }
                    : null
                }
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
              placeholder="Notas adicionales sobre la clase..."
            />
          </div>

          {/* Payment Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              <strong>💰 Pago Manual:</strong> Esta clase se marcará como pagada
              manualmente por el administrador.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loadingPlayers ||
                loadingInstructors ||
                !selectedCourtObj ||
                !selectedTime ||
                !selectedInstructor
              }
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isSubmitting ? "Creando..." : "Crear Clase"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
          {(!selectedInstructor || !selectedCourtObj || !selectedTime) && (
            <p className="text-sm text-muted-foreground">
              * Debes seleccionar un instructor, cancha y horario antes de crear
              la clase
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
