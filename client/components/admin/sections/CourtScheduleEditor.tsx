import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import type { EventCourtSchedule } from "@shared/types";

interface CourtScheduleEditorProps {
  courts: Array<{ id: number; name: string }>;
  schedules: Omit<EventCourtSchedule, "id" | "event_id" | "created_at">[];
  onChange: (
    schedules: Omit<EventCourtSchedule, "id" | "event_id" | "created_at">[],
  ) => void;
  eventStartTime: string;
  eventEndTime: string;
}

export default function CourtScheduleEditor({
  courts,
  schedules,
  onChange,
  eventStartTime,
  eventEndTime,
}: CourtScheduleEditorProps) {
  const addSchedule = () => {
    onChange([
      ...schedules,
      {
        court_id: courts[0]?.id || 1,
        start_time: eventStartTime || "08:00",
        end_time: eventEndTime || "09:00",
        notes: null,
      },
    ]);
  };

  const removeSchedule = (index: number) => {
    onChange(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (
    index: number,
    field: keyof Omit<EventCourtSchedule, "id" | "event_id" | "created_at">,
    value: any,
  ) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Horarios Específicos por Cancha (Opcional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSchedule}
          disabled={courts.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Horario
        </Button>
      </div>

      {schedules.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-muted rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Cancha</Label>
                  <select
                    value={schedule.court_id}
                    onChange={(e) =>
                      updateSchedule(
                        index,
                        "court_id",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Hora Inicio</Label>
                  <Input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) =>
                      updateSchedule(index, "start_time", e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Hora Fin</Label>
                  <Input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) =>
                      updateSchedule(index, "end_time", e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Notas (Opcional)</Label>
                  <Input
                    type="text"
                    value={schedule.notes || ""}
                    onChange={(e) =>
                      updateSchedule(index, "notes", e.target.value || null)
                    }
                    placeholder="Ej: Final del torneo"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSchedule(index)}
                className="mt-5"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        💡 Por defecto, todas las canchas seleccionadas se bloquean durante todo
        el evento. Solo agrega horarios específicos si necesitas que una cancha
        esté disponible parcialmente para reservas.
      </p>
    </div>
  );
}
