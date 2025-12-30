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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AddInstructorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  instructor?: any;
}

const instructorSchema = Yup.object({
  name: Yup.string().required("El nombre es requerido"),
  email: Yup.string().email("Email inválido").required("El email es requerido"),
  phone: Yup.string().nullable(),
  bio: Yup.string().nullable(),
  specialties: Yup.string().nullable(),
  years_of_experience: Yup.number().min(0, "Debe ser mayor o igual a 0"),
  rating: Yup.number()
    .min(0, "La calificación debe ser entre 0 y 5")
    .max(5, "La calificación debe ser entre 0 y 5"),
  hourly_rate: Yup.number()
    .required("La tarifa es requerida")
    .min(0, "La tarifa debe ser mayor a 0"),
  profile_image_url: Yup.string().url("URL inválida").nullable(),
  is_active: Yup.boolean(),
});

export default function AddInstructorModal({
  open,
  onClose,
  onSuccess,
  instructor,
}: AddInstructorModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: instructor?.name || "",
      email: instructor?.email || "",
      phone: instructor?.phone || "",
      bio: instructor?.bio || "",
      specialties: instructor?.specialties || "",
      years_of_experience: instructor?.years_of_experience || 0,
      rating: instructor?.rating || 5.0,
      hourly_rate: instructor?.hourly_rate || "",
      profile_image_url: instructor?.profile_image_url || "",
      is_active:
        instructor?.is_active !== undefined ? instructor.is_active : true,
    },
    enableReinitialize: true,
    validationSchema: instructorSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        const adminSessionToken = localStorage.getItem("adminSessionToken");
        const url = instructor
          ? `/api/admin/instructors/${instructor.id}`
          : "/api/admin/instructors";

        const response = await fetch(url, {
          method: instructor ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminSessionToken}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al guardar el instructor");
        }

        toast({
          title: instructor ? "Instructor actualizado" : "Instructor creado",
          description: data.message,
        });

        formik.resetForm();
        onSuccess();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al guardar el instructor",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {instructor ? "Editar Instructor" : "Agregar Nuevo Instructor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...formik.getFieldProps("name")}
                placeholder="Nombre completo del instructor"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-600">
                  {String(formik.errors.name)}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                placeholder="correo@ejemplo.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-600">
                  {String(formik.errors.email)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...formik.getFieldProps("phone")}
                placeholder="+52 123 456 7890"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-600">
                  {String(formik.errors.phone)}
                </p>
              )}
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Tarifa por Hora * (MXN)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                {...formik.getFieldProps("hourly_rate")}
                placeholder="500.00"
              />
              {formik.touched.hourly_rate && formik.errors.hourly_rate && (
                <p className="text-sm text-red-600">
                  {String(formik.errors.hourly_rate)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Años de Experiencia</Label>
              <Input
                id="years_of_experience"
                type="number"
                {...formik.getFieldProps("years_of_experience")}
                placeholder="5"
              />
              {formik.touched.years_of_experience &&
                formik.errors.years_of_experience && (
                  <p className="text-sm text-red-600">
                    {String(formik.errors.years_of_experience)}
                  </p>
                )}
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Calificación (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...formik.getFieldProps("rating")}
                placeholder="5.0"
              />
              {formik.touched.rating && formik.errors.rating && (
                <p className="text-sm text-red-600">
                  {String(formik.errors.rating)}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              {...formik.getFieldProps("bio")}
              placeholder="Describe la experiencia y especialidades del instructor..."
              rows={3}
            />
            {formik.touched.bio && formik.errors.bio && (
              <p className="text-sm text-red-600">
                {String(formik.errors.bio)}
              </p>
            )}
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <Label htmlFor="specialties">
              Especialidades (separadas por comas)
            </Label>
            <Input
              id="specialties"
              {...formik.getFieldProps("specialties")}
              placeholder="Técnica avanzada, Estrategia de juego, Principiantes"
            />
            {formik.touched.specialties && formik.errors.specialties && (
              <p className="text-sm text-red-600">
                {String(formik.errors.specialties)}
              </p>
            )}
          </div>

          {/* Profile Image URL */}
          <div className="space-y-2">
            <Label htmlFor="profile_image_url">URL de Imagen de Perfil</Label>
            <Input
              id="profile_image_url"
              {...formik.getFieldProps("profile_image_url")}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formik.touched.profile_image_url &&
              formik.errors.profile_image_url && (
                <p className="text-sm text-red-600">
                  {String(formik.errors.profile_image_url)}
                </p>
              )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formik.values.is_active}
              onCheckedChange={(checked) =>
                formik.setFieldValue("is_active", checked)
              }
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Instructor activo
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isSubmitting
                ? "Guardando..."
                : instructor
                  ? "Actualizar"
                  : "Crear Instructor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
