import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface InstructorAvailabilityModalProps {
  open: boolean;
  onClose: () => void;
  instructorId: number;
  instructorName: string;
}

interface AvailabilitySlot {
  id: number;
  instructor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const daysOfWeek = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function InstructorAvailabilityModal({
  open,
  onClose,
  instructorId,
  instructorName,
}: InstructorAvailabilityModalProps) {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // New slot form state
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
  });

  useEffect(() => {
    if (open && instructorId) {
      fetchAvailability();
    }
  }, [open, instructorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch(
        `/api/admin/instructors/${instructorId}/availability`,
        {
          headers: {
            Authorization: `Bearer ${adminSessionToken}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setAvailability(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar disponibilidad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch(
        `/api/admin/instructors/${instructorId}/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminSessionToken}`,
          },
          body: JSON.stringify(newSlot),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Disponibilidad agregada",
          description: data.message,
        });
        fetchAvailability();
        // Reset form
        setNewSlot({
          day_of_week: 1,
          start_time: "09:00",
          end_time: "17:00",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar disponibilidad",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async () => {
    if (!deletingId) return;

    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch(
        `/api/admin/instructors/availability/${deletingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminSessionToken}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Disponibilidad eliminada",
          description: data.message,
        });
        fetchAvailability();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar disponibilidad",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Group availability by day
  const groupedAvailability = availability.reduce(
    (acc, slot) => {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = [];
      }
      acc[slot.day_of_week].push(slot);
      return acc;
    },
    {} as Record<number, AvailabilitySlot[]>,
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disponibilidad de {instructorName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Slot Form */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Horario
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Día</Label>
                  <Select
                    value={String(newSlot.day_of_week)}
                    onValueChange={(value) =>
                      setNewSlot({ ...newSlot, day_of_week: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <Input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, start_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <Input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleAddSlot}
                className="mt-4 bg-gradient-to-r from-green-500 to-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            {/* Current Availability */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horarios Actuales
              </h3>

              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando...
                </div>
              ) : Object.keys(groupedAvailability).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay horarios configurados
                </div>
              ) : (
                <div className="space-y-4">
                  {daysOfWeek.map((day, dayIdx) => {
                    const slots = groupedAvailability[dayIdx];
                    if (!slots || slots.length === 0) return null;

                    return (
                      <div key={dayIdx} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {day}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <Badge
                              key={slot.id}
                              variant="secondary"
                              className="bg-green-100 text-green-800 px-3 py-2 flex items-center gap-2"
                            >
                              {slot.start_time.substring(0, 5)} -{" "}
                              {slot.end_time.substring(0, 5)}
                              <button
                                onClick={() => setDeletingId(slot.id)}
                                className="hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El horario será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSlot}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
