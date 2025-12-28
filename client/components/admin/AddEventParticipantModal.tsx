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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAdminPlayers } from "@/store/slices/adminPlayersSlice";

interface AddEventParticipantModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number;
}

const participantSchema = Yup.object({
  user_id: Yup.number().required("Debe seleccionar un jugador"),
  payment_status: Yup.string()
    .oneOf(["paid", "pending"], "Estado de pago inválido")
    .required("El estado de pago es requerido"),
  notes: Yup.string().nullable(),
});

export default function AddEventParticipantModal({
  open,
  onClose,
  onSuccess,
  eventId,
}: AddEventParticipantModalProps) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUserIds, setRegisteredUserIds] = useState<number[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  const { players, isLoading: isLoadingPlayers } = useAppSelector(
    (state) => state.adminPlayers,
  );

  // Load players and current participants when modal opens
  useEffect(() => {
    if (open) {
      if (players.length === 0) {
        dispatch(getAdminPlayers());
      }
      fetchCurrentParticipants();
    }
  }, [open, players.length, dispatch]);

  const fetchCurrentParticipants = async () => {
    try {
      setIsLoadingParticipants(true);
      const response = await fetch(`/api/admin/events/${eventId}/participants`);
      const data = await response.json();

      if (data.success) {
        const userIds = data.data.map(
          (participant: any) => participant.user_id,
        );
        setRegisteredUserIds(userIds);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Filter out already registered players
  const availablePlayers = players.filter(
    (player) => !registeredUserIds.includes(player.id),
  );

  const formik = useFormik({
    initialValues: {
      user_id: 0,
      payment_status: "paid" as "paid" | "pending",
      notes: "",
    },
    validationSchema: participantSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        const adminSessionToken = localStorage.getItem("adminSessionToken");
        const response = await fetch(
          `/api/admin/events/${eventId}/participants`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminSessionToken}`,
            },
            body: JSON.stringify(values),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al agregar participante");
        }

        toast({
          title: "Participante agregado",
          description: `Registro ${data.registrationNumber} creado exitosamente`,
        });

        formik.resetForm();
        onSuccess();
        onClose();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al agregar participante",
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
          <DialogTitle>Agregar Participante al Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label htmlFor="user_id">Jugador *</Label>
            <Select
              value={formik.values.user_id.toString()}
              onValueChange={(value) =>
                formik.setFieldValue("user_id", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un jugador" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPlayers || isLoadingParticipants ? (
                  <SelectItem value="0" disabled>
                    Cargando jugadores...
                  </SelectItem>
                ) : availablePlayers.length === 0 ? (
                  <SelectItem value="0" disabled>
                    {players.length === 0
                      ? "No hay jugadores disponibles"
                      : "Todos los jugadores ya están registrados"}
                  </SelectItem>
                ) : (
                  availablePlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} ({player.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {formik.touched.user_id && formik.errors.user_id && (
              <p className="text-sm text-red-600">{formik.errors.user_id}</p>
            )}
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment_status">Estado de Pago *</Label>
            <Select
              value={formik.values.payment_status}
              onValueChange={(value) =>
                formik.setFieldValue("payment_status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.payment_status && formik.errors.payment_status && (
              <p className="text-sm text-red-600">
                {formik.errors.payment_status}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...formik.getFieldProps("notes")}
              placeholder="Información adicional sobre el registro..."
              rows={3}
            />
            {formik.touched.notes && formik.errors.notes && (
              <p className="text-sm text-red-600">{formik.errors.notes}</p>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Nota:</strong> El participante será registrado con el
              estado seleccionado. Si marca como "Pagado", se considerará que el
              pago fue realizado manualmente en el club.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingPlayers ||
                isLoadingParticipants ||
                availablePlayers.length === 0
              }
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSubmitting ? "Agregando..." : "Agregar Participante"}
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
