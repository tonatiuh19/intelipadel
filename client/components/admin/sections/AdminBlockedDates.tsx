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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
} from "@/store/slices/adminBlockedDatesSlice";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getBlockedSlots());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      club_id: 0,
      court_id: null as number | null,
      block_type: "maintenance",
      block_date: selectedDate || new Date(),
      start_time: "",
      end_time: "",
      is_all_day: false,
      reason: "",
      notes: "",
    },
    validationSchema: blockSchema,
    enableReinitialize: true,
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

        toast({ title: "Blocked slot created successfully" });
        setDialogOpen(false);
        formik.resetForm();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err || "Failed to create blocked slot",
          variant: "destructive",
        });
      }
    },
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blocked slot?")) return;

    try {
      await dispatch(deleteBlockedSlot(id)).unwrap();
      toast({ title: "Blocked slot deleted successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err || "Failed to delete blocked slot",
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="club_id">ID del Club</Label>
                  <Input
                    id="club_id"
                    type="number"
                    {...formik.getFieldProps("club_id")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="court_id">ID de Cancha (Opcional)</Label>
                  <Input
                    id="court_id"
                    type="number"
                    value={formik.values.court_id || ""}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "court_id",
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Bloqueo</Label>
                <Select
                  value={formik.values.block_type}
                  onValueChange={(value) =>
                    formik.setFieldValue("block_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="holiday">Día Festivo</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="private_event">
                      Evento Privado
                    </SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Bloqueo</Label>
                <Calendar
                  mode="single"
                  selected={formik.values.block_date}
                  onSelect={(date) =>
                    date && formik.setFieldValue("block_date", date)
                  }
                  className="rounded-md border"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      {...formik.getFieldProps("end_time")}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" {...formik.getFieldProps("reason")} />
                {formik.touched.reason && formik.errors.reason && (
                  <p className="text-sm text-red-600">{formik.errors.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" {...formik.getFieldProps("notes")} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Creating..." : "Create Block"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
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
                      {new Date(slot.block_date).toLocaleDateString()}
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
