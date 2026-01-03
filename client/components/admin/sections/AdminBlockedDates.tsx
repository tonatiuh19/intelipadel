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
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
} from "@/store/slices/adminBlockedDatesSlice";
import { getAdminCourts } from "@/store/slices/adminCourtsSlice";

const blockSchema = Yup.object({
  club_id: Yup.number().required("Club is required"),
  court_id: Yup.number().nullable(),
  block_type: Yup.string().required("Block type is required"),
  block_date: Yup.date().required("Date is required"),
  start_time: Yup.string().when("is_all_day", {
    is: false,
    then: (schema) => schema.required("Start time is required"),
  }),
  end_time: Yup.string().when("is_all_day", {
    is: false,
    then: (schema) => schema.required("End time is required"),
  }),
  is_all_day: Yup.boolean(),
  reason: Yup.string().required("Reason is required"),
});

export default function AdminBlockedDates() {
  const dispatch = useAppDispatch();
  const { blockedSlots, isLoading, isSubmitting } = useAppSelector(
    (state) => state.adminBlockedDates,
  );
  const { admin } = useAppSelector((state) => state.adminAuth);
  const { courts } = useAppSelector((state) => state.adminCourts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getBlockedSlots());
    dispatch(getAdminCourts());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      club_id: admin?.club_id || 0,
      court_id: null as number | null,
      block_type: "maintenance",
      block_date: new Date(),
      start_time: "",
      end_time: "",
      is_all_day: false,
      reason: "",
      notes: "",
    },
    validationSchema: blockSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(
          createBlockedSlot({
            ...values,
            block_date: format(values.block_date, "yyyy-MM-dd"),
            start_time: values.is_all_day ? null : values.start_time,
            end_time: values.is_all_day ? null : values.end_time,
          }),
        ).unwrap();

        toast({ title: "Bloqueo creado exitosamente" });
        setDialogOpen(false);
        formik.resetForm();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err || "No se pudo crear el bloqueo",
          variant: "destructive",
        });
      }
    },
  });

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este bloqueo?")) return;

    try {
      await dispatch(deleteBlockedSlot(id)).unwrap();
      toast({ title: "Bloqueo eliminado exitosamente" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err || "No se pudo eliminar el bloqueo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fechas Bloqueadas
          </h1>
          <p className="text-gray-600 mt-1">
            Administra bloqueos de disponibilidad de canchas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Bloquear Fecha/Hora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Bloqueo</DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="court_id">Cancha (Opcional)</Label>
                <select
                  id="court_id"
                  name="court_id"
                  value={
                    formik.values.court_id === null
                      ? ""
                      : String(formik.values.court_id)
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const newCourtId = value === "" ? null : Number(value);
                    formik.setFieldValue("court_id", newCourtId, false);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="">Todas las canchas</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="block_type">Tipo de Bloqueo</Label>
                <select
                  id="block_type"
                  name="block_type"
                  value={formik.values.block_type}
                  onChange={(e) => {
                    formik.setFieldValue("block_type", e.target.value, false);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="maintenance">Mantenimiento</option>
                  <option value="holiday">Día Festivo</option>
                  <option value="event">Evento</option>
                  <option value="private_event">Evento Privado</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="block_date">Fecha de Bloqueo</Label>
                <Input
                  id="block_date"
                  type="date"
                  value={format(formik.values.block_date, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const [year, month, day] = e.target.value
                      .split("-")
                      .map(Number);
                    formik.setFieldValue(
                      "block_date",
                      new Date(year, month - 1, day),
                    );
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_all_day"
                  checked={formik.values.is_all_day}
                  onChange={(e) =>
                    formik.setFieldValue("is_all_day", e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_all_day" className="cursor-pointer">
                  Bloqueo de Todo el Día
                </Label>
              </div>

              {!formik.values.is_all_day && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio</Label>
                    <Input
                      id="start_time"
                      type="time"
                      {...formik.getFieldProps("start_time")}
                    />
                    {formik.touched.start_time && formik.errors.start_time && (
                      <p className="text-sm text-red-600">
                        {formik.errors.start_time}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Fin</Label>
                    <Input
                      id="end_time"
                      type="time"
                      {...formik.getFieldProps("end_time")}
                    />
                    {formik.touched.end_time && formik.errors.end_time && (
                      <p className="text-sm text-red-600">
                        {formik.errors.end_time}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Razón</Label>
                <Input id="reason" {...formik.getFieldProps("reason")} />
                {formik.touched.reason && formik.errors.reason && (
                  <p className="text-sm text-red-600">{formik.errors.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea id="notes" {...formik.getFieldProps("notes")} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Bloqueo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    formik.resetForm();
                  }}
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
          <CardTitle>Bloqueos ({blockedSlots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : blockedSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay bloqueos
            </div>
          ) : (
            <div className="space-y-3">
              {blockedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{slot.reason}</p>
                    <p className="text-sm text-gray-600">
                      {slot.club_name}{" "}
                      {slot.court_name ? `- ${slot.court_name}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const [year, month, day] = slot.block_date
                          .split("-")
                          .map(Number);
                        return new Date(
                          year,
                          month - 1,
                          day,
                        ).toLocaleDateString();
                      })()}
                      {!slot.is_all_day &&
                        ` • ${slot.start_time} - ${slot.end_time}`}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 mt-1">
                      {slot.block_type}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(slot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
