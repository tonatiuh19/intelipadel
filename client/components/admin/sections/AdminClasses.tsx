import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Star, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminInstructors,
  deleteAdminInstructor,
} from "@/store/slices/adminInstructorsSlice";
import AddInstructorModal from "../AddInstructorModal";
import InstructorAvailabilityModal from "../InstructorAvailabilityModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminClasses() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { instructors, loading } = useAppSelector(
    (state) => state.adminInstructors,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [availabilityInstructor, setAvailabilityInstructor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [availabilityCounts, setAvailabilityCounts] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    dispatch(fetchAdminInstructors());
  }, [dispatch]);

  // Fetch availability counts for all instructors
  useEffect(() => {
    const fetchAvailabilityCounts = async () => {
      if (instructors.length === 0) return;

      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const counts: Record<number, number> = {};

      await Promise.all(
        instructors.map(async (instructor) => {
          try {
            const response = await fetch(
              `/api/admin/instructors/${instructor.id}/availability`,
              {
                headers: {
                  Authorization: `Bearer ${adminSessionToken}`,
                },
              },
            );
            const data = await response.json();
            counts[instructor.id] = data.success ? data.data.length : 0;
          } catch (error) {
            counts[instructor.id] = 0;
          }
        }),
      );

      setAvailabilityCounts(counts);
    };

    fetchAvailabilityCounts();
  }, [instructors]);

  const filteredInstructors = instructors.filter((instructor) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(search) ||
      instructor.email.toLowerCase().includes(search) ||
      (instructor.specialties || "").toLowerCase().includes(search)
    );
  });

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await dispatch(deleteAdminInstructor(deletingId)).unwrap();
      toast({
        title: "Instructor eliminado",
        description: "El instructor se eliminó exitosamente",
      });
      setDeletingId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Error al eliminar el instructor",
        variant: "destructive",
      });
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clases Privadas</h1>
          <p className="text-gray-600 mt-1">
            Administra instructores y clases privadas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingInstructor(null);
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Instructor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Instructores ({filteredInstructors.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar instructores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando instructores...
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron instructores
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {instructor.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            instructor.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {instructor.is_active ? "Activo" : "Inactivo"}
                        </span>
                        {instructor.is_active &&
                          availabilityCounts[instructor.id] === 0 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              ⚠️ Sin disponibilidad
                            </span>
                          )}
                      </div>

                      {instructor.is_active &&
                        availabilityCounts[instructor.id] === 0 && (
                          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                            Este instructor necesita configurar su
                            disponibilidad para aparecer en el sistema de
                            reservas.{" "}
                            <button
                              onClick={() =>
                                setAvailabilityInstructor({
                                  id: instructor.id,
                                  name: instructor.name,
                                })
                              }
                              className="underline font-medium hover:text-amber-900"
                            >
                              Configurar ahora
                            </button>
                          </div>
                        )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Contacto</p>
                          <p className="text-sm font-medium text-gray-900">
                            {instructor.email}
                          </p>
                          {instructor.phone && (
                            <p className="text-sm text-gray-700">
                              {instructor.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">
                            Tarifa por Hora
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            ${Number(instructor.hourly_rate).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Experiencia</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {instructor.years_of_experience} años
                            </span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium ml-1">
                                {instructor.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {instructor.bio && (
                        <p className="text-sm text-gray-700 mt-2">
                          {instructor.bio}
                        </p>
                      )}

                      {instructor.specialties &&
                        typeof instructor.specialties === "string" &&
                        instructor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {instructor.specialties
                              .split(",")
                              .filter((s) => s.trim())
                              .map((specialty: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-green-100 text-green-800"
                                >
                                  {specialty.trim()}
                                </Badge>
                              ))}
                          </div>
                        )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAvailabilityInstructor({
                            id: instructor.id,
                            name: instructor.name,
                          })
                        }
                        className="hover:bg-blue-50 hover:border-blue-500"
                        title="Gestionar disponibilidad"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingInstructor(instructor);
                          setShowAddModal(true);
                        }}
                        className="hover:bg-green-50 hover:border-green-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingId(instructor.id)}
                        className="hover:bg-red-50 hover:border-red-500 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Instructor Modal */}
      <AddInstructorModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingInstructor(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingInstructor(null);
          dispatch(fetchAdminInstructors());
        }}
        instructor={editingInstructor}
      />

      {/* Instructor Availability Modal */}
      {availabilityInstructor && (
        <InstructorAvailabilityModal
          open={!!availabilityInstructor}
          onClose={() => {
            setAvailabilityInstructor(null);
            // Refresh availability counts after closing modal
            dispatch(fetchAdminInstructors());
          }}
          instructorId={availabilityInstructor.id}
          instructorName={availabilityInstructor.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar instructor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El instructor será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
