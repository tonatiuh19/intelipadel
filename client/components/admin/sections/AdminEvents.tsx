import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAdminEvents,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
} from "@/store/slices/adminEventsSlice";
import { getAdminCourts } from "@/store/slices/adminCourtsSlice";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CourtScheduleEditor from "./CourtScheduleEditor";
import ParticipantsList from "../ParticipantsList";
import type { Event, EventCourtSchedule } from "@shared/types";

const eventSchema = Yup.object({
  event_type: Yup.string().required("El tipo de evento es requerido"),
  title: Yup.string().required("El título es requerido"),
  description: Yup.string(),
  event_date: Yup.string().required("La fecha es requerida"),
  start_time: Yup.string().required("La hora de inicio es requerida"),
  end_time: Yup.string().required("La hora de fin es requerida"),
  max_participants: Yup.number().nullable(),
  registration_fee: Yup.number().min(0).required("La cuota es requerida"),
  prize_pool: Yup.number().min(0).required("El premio es requerido"),
  skill_level: Yup.string().required("El nivel es requerido"),
  status: Yup.string().required("El estado es requerido"),
  courts_used: Yup.array()
    .of(Yup.number())
    .required("Selecciona al menos una cancha"),
});

export default function AdminEvents() {
  const dispatch = useAppDispatch();
  const { events, isLoading, isSubmitting } = useAppSelector(
    (state) => state.adminEvents,
  );
  const { admin } = useAppSelector((state) => state.adminAuth);
  const { courts } = useAppSelector((state) => state.adminCourts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewParticipantsOpen, setViewParticipantsOpen] = useState(false);
  const [selectedEventForView, setSelectedEventForView] =
    useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
  const [courtSchedules, setCourtSchedules] = useState<
    Omit<EventCourtSchedule, "id" | "event_id" | "created_at">[]
  >([]);
  const [courtSchedulesError, setCourtSchedulesError] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getAdminEvents());
    dispatch(getAdminCourts());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      event_type: editingEvent?.event_type || "tournament",
      title: editingEvent?.title || "",
      description: editingEvent?.description || "",
      event_date: editingEvent?.event_date || "",
      start_time: editingEvent?.start_time || "",
      end_time: editingEvent?.end_time || "",
      max_participants: editingEvent?.max_participants || null,
      registration_fee: editingEvent?.registration_fee || 0,
      prize_pool: editingEvent?.prize_pool || 0,
      skill_level: editingEvent?.skill_level || "all",
      status: editingEvent?.status || "draft",
      courts_used: editingEvent?.courts_used || [],
    },
    validationSchema: eventSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (!admin?.club_id) {
          toast({
            title: "Error",
            description: "No se pudo obtener la información del club",
            variant: "destructive",
          });
          return;
        }

        const eventData = {
          ...values,
          club_id: admin.club_id,
          courts_used: selectedCourts,
          court_schedules: courtSchedules,
        };

        if (editingEventId) {
          await dispatch(
            updateAdminEvent({ id: editingEventId, ...eventData }),
          ).unwrap();
          toast({ title: "Evento actualizado exitosamente" });
        } else {
          await dispatch(createAdminEvent(eventData)).unwrap();
          toast({ title: "Evento creado exitosamente" });
        }

        setDialogOpen(false);
        setEditingEvent(null);
        setEditingEventId(null);
        setSelectedCourts([]);
        setCourtSchedules([]);
        formik.resetForm();
      } catch (err: any) {
        toast({
          title: "Error",
          description:
            err?.message || err?.toString() || "Error al guardar el evento",
          variant: "destructive",
        });
      }
    },
  });

  useEffect(() => {
    if (editingEvent) {
      setSelectedCourts(editingEvent.courts_used || []);
      setCourtSchedules(editingEvent.court_schedules || []);
    }
  }, [editingEvent]);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setEditingEventId(event.id);
    setDialogOpen(true);
  };

  const handleViewParticipants = (event: Event) => {
    setSelectedEventForView(event);
    setViewParticipantsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      await dispatch(deleteAdminEvent(id)).unwrap();
      toast({ title: "Evento eliminado exitosamente" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Error al eliminar el evento",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setEditingEventId(null);
    setSelectedCourts([]);
    setCourtSchedules([]);
    formik.resetForm();
  };

  const toggleCourt = (courtId: number) => {
    setSelectedCourts((prev) =>
      prev.includes(courtId)
        ? prev.filter((id) => id !== courtId)
        : [...prev, courtId],
    );
    formik.setFieldValue(
      "courts_used",
      selectedCourts.includes(courtId)
        ? selectedCourts.filter((id) => id !== courtId)
        : [...selectedCourts, courtId],
    );
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tournament: "Torneo",
      league: "Liga",
      clinic: "Clínica",
      social: "Social",
      championship: "Campeonato",
    };
    return labels[type] || type;
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      all: "Todos",
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      expert: "Experto",
    };
    return labels[level] || level;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Borrador",
      open: "Abierto",
      full: "Lleno",
      in_progress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      open: "bg-green-100 text-green-800",
      full: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Gestión de Eventos
          </h1>
          <p className="mt-1">Administra eventos y torneos de tu club</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingEvent(null);
                setEditingEventId(null);
                setSelectedCourts([]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Editar Evento" : "Agregar Nuevo Evento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_type">Tipo de Evento</Label>
                  <Select
                    value={formik.values.event_type}
                    onValueChange={(value) =>
                      formik.setFieldValue("event_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tournament">Torneo</SelectItem>
                      <SelectItem value="league">Liga</SelectItem>
                      <SelectItem value="clinic">Clínica</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="championship">Campeonato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="open">Abierto</SelectItem>
                      <SelectItem value="full">Lleno</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...formik.getFieldProps("title")} />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-sm text-red-600">{formik.errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...formik.getFieldProps("description")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Fecha</Label>
                  <Input
                    id="event_date"
                    type="date"
                    {...formik.getFieldProps("event_date")}
                  />
                  {formik.touched.event_date && formik.errors.event_date && (
                    <p className="text-sm text-red-600">
                      {formik.errors.event_date}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora Inicio</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...formik.getFieldProps("start_time")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora Fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...formik.getFieldProps("end_time")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participantes</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    {...formik.getFieldProps("max_participants")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skill_level">Nivel</Label>
                  <Select
                    value={formik.values.skill_level}
                    onValueChange={(value) =>
                      formik.setFieldValue("skill_level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                      <SelectItem value="expert">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_fee">
                    Cuota de Inscripción ($)
                  </Label>
                  <Input
                    id="registration_fee"
                    type="number"
                    step="0.01"
                    {...formik.getFieldProps("registration_fee")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize_pool">Premio Total ($)</Label>
                  <Input
                    id="prize_pool"
                    type="number"
                    step="0.01"
                    {...formik.getFieldProps("prize_pool")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Canchas Utilizadas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {courts.map((court) => (
                    <div
                      key={court.id}
                      onClick={() => toggleCourt(court.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedCourts.includes(court.id)
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-sm">{court.name}</p>
                      <p className="text-xs ">
                        {court.court_type === "indoor"
                          ? "Techada"
                          : court.court_type === "covered"
                            ? "Cubierta"
                            : "Exterior"}
                      </p>
                    </div>
                  ))}
                </div>
                {formik.touched.courts_used && formik.errors.courts_used && (
                  <p className="text-sm text-red-600">
                    {formik.errors.courts_used as string}
                  </p>
                )}
              </div>

              {/* Granular Court Schedules */}
              <CourtScheduleEditor
                courts={courts
                  .filter((c) => selectedCourts.includes(c.id))
                  .map((c) => ({ id: c.id, name: c.name }))}
                schedules={courtSchedules}
                onChange={(schedules) => {
                  setCourtSchedules(schedules);
                  if (schedules.length > 0) {
                    setCourtSchedulesError("");
                  }
                }}
                eventStartTime={formik.values.start_time}
                eventEndTime={formik.values.end_time}
              />
              {courtSchedulesError && (
                <p className="text-sm text-red-600">{courtSchedulesError}</p>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Evento"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando eventos...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron eventos
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-4 bg-card border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}
                      >
                        {getStatusLabel(event.status)}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{event.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-sm ">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.event_date), "PPP", {
                          locale: es,
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm ">
                        <Users className="h-4 w-4" />
                        {event.current_participants}/
                        {event.max_participants || "∞"}
                      </div>
                      <div className="flex items-center gap-2 text-sm ">
                        <DollarSign className="h-4 w-4" />$
                        {Number(event.registration_fee).toFixed(2)}
                      </div>
                      <div className="text-sm ">
                        Nivel: {getSkillLevelLabel(event.skill_level)}
                      </div>
                    </div>
                    {event.courts_used && event.courts_used.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Canchas:{" "}
                          {event.courts_used
                            .map((courtId) => {
                              const court = courts.find(
                                (c) => c.id === courtId,
                              );
                              return court?.name;
                            })
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewParticipants(event)}
                      title="Ver Participantes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants Dialog */}
      <Dialog
        open={viewParticipantsOpen}
        onOpenChange={setViewParticipantsOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Participantes - {selectedEventForView?.title}
            </DialogTitle>
          </DialogHeader>
          <ParticipantsList eventId={selectedEventForView?.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
