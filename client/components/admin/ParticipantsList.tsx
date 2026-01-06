import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AddEventParticipantModal from "./AddEventParticipantModal";

interface Participant {
  participant_id: number;
  registration_date: string;
  payment_status: string;
  status: string;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  payment_amount: string;
  stripe_payment_intent_id: string;
  paid_at: string;
}

interface ParticipantsListProps {
  eventId?: number;
}

export default function ParticipantsList({ eventId }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/events/${eventId}/participants`);
      const data = await response.json();

      if (data.success) {
        setParticipants(data.data);
      } else {
        setError(data.message || "Error al cargar participantes");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchParticipants(); // Refresh the participants list
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (participants.length === 0 && !eventId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Selecciona un evento para ver participantes
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Total: {participants.length} participante
          {participants.length !== 1 ? "s" : ""}
        </p>
        {eventId && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Participante
          </Button>
        )}
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay participantes inscritos aún
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Fecha Inscripción</TableHead>
              <TableHead>Estado Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.participant_id}>
                <TableCell className="font-medium">
                  {participant.name}
                </TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell>{participant.phone || "-"}</TableCell>
                <TableCell>
                  {format(
                    new Date(participant.registration_date),
                    "dd MMM yyyy, HH:mm",
                    {
                      locale: es,
                    },
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      participant.payment_status === "paid"
                        ? "default"
                        : participant.payment_status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {participant.payment_status === "paid"
                      ? "Pagado"
                      : participant.payment_status === "pending"
                        ? "Pendiente"
                        : participant.payment_status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {eventId && (
        <AddEventParticipantModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
          eventId={eventId}
        />
      )}
    </div>
  );
}
