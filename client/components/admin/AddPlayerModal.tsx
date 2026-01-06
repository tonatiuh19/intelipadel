import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const playerSchema = Yup.object({
  name: Yup.string().required("El nombre es requerido"),
  email: Yup.string().email("Email inválido").required("El email es requerido"),
  phone: Yup.string().nullable(),
});

export default function AddPlayerModal({
  open,
  onClose,
  onSuccess,
}: AddPlayerModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
    },
    validationSchema: playerSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        const adminSessionToken = localStorage.getItem("adminSessionToken");
        const response = await fetch("/api/admin/players", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminSessionToken}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al crear el jugador");
        }

        toast({
          title: "Jugador creado",
          description: "El jugador se creó exitosamente",
        });

        formik.resetForm();
        onSuccess();
        onClose();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al crear el jugador",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Jugador</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...formik.getFieldProps("name")}
              placeholder="Nombre completo del jugador"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-600">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              placeholder="email@ejemplo.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-600">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              {...formik.getFieldProps("phone")}
              placeholder="+34 123 456 789"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-red-600">{formik.errors.phone}</p>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Nota:</strong> El jugador podrá iniciar sesión con este
              email usando el código de verificación.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? "Creando..." : "Crear Jugador"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
