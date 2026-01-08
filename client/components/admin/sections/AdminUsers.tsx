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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAdmins, createAdmin } from "@/store/slices/adminUsersSlice";

const adminSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  name: Yup.string().required("Name is required"),
  role: Yup.string().required("Role is required"),
  club_id: Yup.number().nullable(),
});

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const { admins, isLoading, isSubmitting } = useAppSelector(
    (state) => state.adminUsers,
  );
  const currentAdmin = useAppSelector((state) => state.adminAuth.admin);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getAdmins());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      role: "club_admin",
      club_id: currentAdmin?.club_id || null,
    },
    validationSchema: adminSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(createAdmin(values)).unwrap();
        toast({ title: "Admin created successfully" });
        setDialogOpen(false);
        formik.resetForm();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err || "Failed to create admin",
          variant: "destructive",
        });
      }
    },
  });

  // Only super admins can access this page
  if (currentAdmin?.role !== "super_admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              Solo los súper administradores pueden gestionar usuarios admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Usuarios Admin</h1>
          <p className="mt-1">Administra cuentas de administrador</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...formik.getFieldProps("name")} />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formik.values.role}
                  onValueChange={(value) => formik.setFieldValue("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Súper Admin</SelectItem>
                    <SelectItem value="club_admin">Admin de Club</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentAdmin?.role === "super_admin" && (
                <div className="space-y-2">
                  <Label htmlFor="club_id">
                    ID de Club (para Admins de Club)
                  </Label>
                  <Input
                    disabled
                    id="club_id"
                    type="number"
                    value={formik.values.club_id || ""}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "club_id",
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Admin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
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
          <CardTitle>Administradores ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando administradores...
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron administradores
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-card border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-primary">{admin.name}</p>
                    <p className="text-sm">{admin.email}</p>
                    <p className="text-xs">{admin.phone}</p>
                    {admin.club_name && (
                      <p className="text-xs text-blue-600 mt-1">
                        {admin.club_name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
                      {admin.role?.replace("_", " ") || "N/A"}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        admin.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
