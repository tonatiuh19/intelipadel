import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAdminCourts,
  createAdminCourt,
  updateAdminCourt,
} from "@/store/slices/adminCourtsSlice";

interface Court {
  id: number;
  name: string;
  court_type: string;
  is_active: boolean;
  club_name?: string;
  club_id: number;
}

const courtSchema = Yup.object({
  name: Yup.string().required("El nombre de la cancha es requerido"),
  type: Yup.string().required("El tipo de cancha es requerido"),
  is_active: Yup.boolean(),
});

export default function AdminCourts() {
  const dispatch = useAppDispatch();
  const { courts, isLoading, isSubmitting } = useAppSelector(
    (state) => state.adminCourts,
  );
  const { admin } = useAppSelector((state) => state.adminAuth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getAdminCourts());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: editingCourt?.name || "",
      type: editingCourt?.court_type || "indoor",
      is_active: editingCourt?.is_active ?? true,
    },
    validationSchema: courtSchema,
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

        const courtData = {
          ...values,
          club_id: admin.club_id,
        };

        if (editingCourtId) {
          await dispatch(
            updateAdminCourt({ id: editingCourtId, ...courtData }),
          ).unwrap();
          toast({ title: "Cancha actualizada exitosamente" });
        } else {
          await dispatch(createAdminCourt(courtData)).unwrap();
          toast({ title: "Cancha creada exitosamente" });
        }

        setDialogOpen(false);
        setEditingCourt(null);
        setEditingCourtId(null);
        formik.resetForm();
      } catch (err: any) {
        toast({
          title: "Error",
          description:
            err?.message || err?.toString() || "Error al guardar la cancha",
          variant: "destructive",
        });
      }
    },
  });

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
    setEditingCourtId(court.id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourt(null);
    setEditingCourtId(null);
    formik.resetForm();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Canchas
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las canchas de tu club
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCourt(null);
                setEditingCourtId(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cancha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourt ? "Editar Cancha" : "Agregar Nueva Cancha"}
              </DialogTitle>
              {editingCourt && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-gray-600">
                    {editingCourt.name}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {editingCourt.court_type === "indoor"
                      ? "Techada"
                      : editingCourt.court_type === "covered"
                        ? "Cubierta"
                        : "Exterior"}
                  </span>
                </div>
              )}
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Cancha</Label>
                <Input id="name" {...formik.getFieldProps("name")} />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="court_type">Tipo de Cancha</Label>
                <Select
                  value={formik.values.type}
                  onValueChange={(value) => formik.setFieldValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Techada</SelectItem>
                    <SelectItem value="outdoor">Exterior</SelectItem>
                    <SelectItem value="covered">Cubierta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formik.values.is_active}
                  onChange={(e) =>
                    formik.setFieldValue("is_active", e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Activa
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Cancha"}
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
          <CardTitle>Canchas ({courts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando canchas...
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron canchas
            </div>
          ) : (
            <div className="space-y-3">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{court.name}</p>
                    <p className="text-sm text-gray-600">{court.club_name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {court.court_type === "indoor"
                          ? "Techada"
                          : court.court_type === "covered"
                            ? "Cubierta"
                            : "Exterior"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          court.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {court.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(court)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
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
