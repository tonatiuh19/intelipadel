import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Clock, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  getPriceRules,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
  getSchedules,
  updateSchedule,
  updateClubSettings,
  getCourts,
  setBasePrice,
  setDefaultDuration,
} from "@/store/slices/adminSettingsSlice";

interface PriceRule {
  id: number;
  club_id: number;
  court_id: number | null;
  rule_name: string;
  rule_type: "time_of_day" | "day_of_week" | "seasonal" | "special_date";
  start_time: string | null;
  end_time: string | null;
  days_of_week: number[] | null;
  start_date: string | null;
  end_date: string | null;
  price_per_hour: number;
  priority: number;
  is_active: boolean;
}

interface ClubSchedule {
  id: number;
  club_id: number;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

interface Court {
  id: number;
  name: string;
  club_id: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const RULE_TYPES = [
  { value: "time_of_day", label: "Hora del Día" },
  { value: "day_of_week", label: "Día de la Semana" },
  { value: "seasonal", label: "Temporada" },
  { value: "special_date", label: "Fecha Especial" },
];

const DURATION_OPTIONS = [
  { value: 60, label: "1 hora (60 min)" },
  { value: 90, label: "1.5 horas (90 min)" },
  { value: 120, label: "2 horas (120 min)" },
];

export default function AdminSettings() {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.adminAuth);
  const {
    priceRules,
    schedules,
    courts,
    basePrice,
    defaultDuration,
    isLoading,
    isSubmitting,
  } = useAppSelector((state) => state.adminSettings);
  const { toast } = useToast();

  const [localBasePrice, setLocalBasePrice] = useState<number>(basePrice);
  const [localDefaultDuration, setLocalDefaultDuration] =
    useState<number>(defaultDuration);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);

  // Form states for price rule dialog
  const [ruleName, setRuleName] = useState("");
  const [ruleType, setRuleType] =
    useState<PriceRule["rule_type"]>("time_of_day");
  const [courtId, setCourtId] = useState<string>("all");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [priority, setPriority] = useState("1");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (admin?.club_id) {
      fetchSettings();
    }
  }, [admin?.club_id]);

  useEffect(() => {
    setLocalBasePrice(basePrice);
  }, [basePrice]);

  useEffect(() => {
    setLocalDefaultDuration(defaultDuration);
  }, [defaultDuration]);

  const fetchSettings = async () => {
    if (!admin?.club_id) return;

    try {
      await Promise.all([
        dispatch(getPriceRules(admin.club_id)).unwrap(),
        dispatch(getSchedules(admin.club_id)).unwrap(),
        dispatch(getCourts(admin.club_id)).unwrap(),
      ]);

      // Fetch club base settings
      const clubResponse = await fetch(`/api/clubs/${admin.club_id}`);
      if (clubResponse.ok) {
        const data = await clubResponse.json();
        const price = data.data?.price_per_hour || 45;
        const duration = data.data?.default_booking_duration || 60;
        setLocalBasePrice(price);
        setLocalDefaultDuration(duration);
        dispatch(setBasePrice(price));
        dispatch(setDefaultDuration(duration));
      }

      console.log("Settings loaded successfully");
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: error || "No se pudieron cargar las configuraciones",
        variant: "destructive",
      });
    }
  };

  const handleSaveBasePrice = async () => {
    if (!admin?.club_id) return;

    try {
      await dispatch(
        updateClubSettings({
          club_id: admin.club_id,
          price_per_hour: localBasePrice,
        }),
      ).unwrap();

      toast({
        title: "Precio base actualizado",
        description: "El precio base se ha guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo actualizar el precio base",
        variant: "destructive",
      });
    }
  };

  const handleSaveDuration = async () => {
    if (!admin?.club_id) return;

    try {
      await dispatch(
        updateClubSettings({
          club_id: admin.club_id,
          default_booking_duration: localDefaultDuration,
        }),
      ).unwrap();

      toast({
        title: "Duración actualizada",
        description: "La duración predeterminada se ha guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo actualizar la duración",
        variant: "destructive",
      });
    }
  };

  const openPriceDialog = (rule?: PriceRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleName(rule.rule_name);
      setRuleType(rule.rule_type);
      setCourtId(rule.court_id?.toString() || "all");
      setStartTime(rule.start_time || "");
      setEndTime(rule.end_time || "");
      setSelectedDays(rule.days_of_week || []);
      setStartDate(rule.start_date || "");
      setEndDate(rule.end_date || "");
      setPricePerHour(rule.price_per_hour.toString());
      setPriority(rule.priority.toString());
      setIsActive(rule.is_active);
    } else {
      resetPriceForm();
    }
    setPriceDialogOpen(true);
  };

  const resetPriceForm = () => {
    setEditingRule(null);
    setRuleName("");
    setRuleType("time_of_day");
    setCourtId("all");
    setStartTime("");
    setEndTime("");
    setSelectedDays([]);
    setStartDate("");
    setEndDate("");
    setPricePerHour("");
    setPriority("1");
    setIsActive(true);
  };

  const handleSavePriceRule = async () => {
    if (!admin?.club_id || !ruleName || !pricePerHour) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const ruleData: any = {
      club_id: admin.club_id,
      court_id: courtId === "all" ? null : parseInt(courtId),
      rule_name: ruleName,
      rule_type: ruleType,
      start_time: startTime || null,
      end_time: endTime || null,
      days_of_week: selectedDays.length > 0 ? selectedDays : null,
      start_date: startDate || null,
      end_date: endDate || null,
      price_per_hour: parseFloat(pricePerHour),
      priority: parseInt(priority),
      is_active: isActive,
    };

    try {
      if (editingRule) {
        await dispatch(
          updatePriceRule({ id: editingRule.id, ...ruleData }),
        ).unwrap();
        toast({
          title: "Regla actualizada",
          description: "La regla de precio se ha guardado correctamente",
        });
      } else {
        await dispatch(createPriceRule(ruleData)).unwrap();
        toast({
          title: "Regla creada",
          description: "La regla de precio se ha guardado correctamente",
        });
      }

      setPriceDialogOpen(false);
      if (admin?.club_id) {
        dispatch(getPriceRules(admin.club_id));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo guardar la regla de precio",
        variant: "destructive",
      });
    }
  };

  const handleDeletePriceRule = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta regla de precio?")) return;

    try {
      await dispatch(deletePriceRule(id)).unwrap();
      toast({
        title: "Regla eliminada",
        description: "La regla de precio se ha eliminado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo eliminar la regla de precio",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSchedule = async (
    scheduleId: number,
    updates: Partial<ClubSchedule>,
  ) => {
    try {
      await dispatch(updateSchedule({ id: scheduleId, updates })).unwrap();
      toast({
        title: "Horario actualizado",
        description: "El horario se ha actualizado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo actualizar el horario",
        variant: "destructive",
      });
    }
  };

  const toggleDaySelection = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Administra precios, horarios y configuraciones del sistema
        </p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Precios y Reglas
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Clock className="h-4 w-4 mr-2" />
            Horarios
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          {/* Base Price */}
          <Card>
            <CardHeader>
              <CardTitle>Precio Base por Hora</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="base-price">Precio Base (MXN)</Label>
                  <Input
                    id="base-price"
                    type="number"
                    value={localBasePrice}
                    onChange={(e) =>
                      setLocalBasePrice(parseFloat(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button onClick={handleSaveBasePrice}>Guardar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Default Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Duración Predeterminada de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="duration">Duración</Label>
                  <Select
                    value={localDefaultDuration.toString()}
                    onValueChange={(val) =>
                      setLocalDefaultDuration(parseInt(val))
                    }
                  >
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value.toString()}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveDuration}>Guardar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Rules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reglas de Precio</CardTitle>
              <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openPriceDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Regla
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRule
                        ? "Editar Regla de Precio"
                        : "Nueva Regla de Precio"}
                    </DialogTitle>
                    <DialogDescription>
                      Define reglas de precio específicas para diferentes
                      horarios, días o temporadas
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rule-name">Nombre de la Regla *</Label>
                      <Input
                        id="rule-name"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="ej. Tarifa Matinal, Fin de Semana Premium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rule-type">Tipo de Regla *</Label>
                      <Select
                        value={ruleType}
                        onValueChange={(val: any) => setRuleType(val)}
                      >
                        <SelectTrigger id="rule-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RULE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="court">Cancha</Label>
                      <Select value={courtId} onValueChange={setCourtId}>
                        <SelectTrigger id="court">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las canchas</SelectItem>
                          {courts.map((court) => (
                            <SelectItem
                              key={court.id}
                              value={court.id.toString()}
                            >
                              {court.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(ruleType === "time_of_day" ||
                      ruleType === "special_date") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Hora Inicio</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">Hora Fin</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {ruleType === "day_of_week" && (
                      <div>
                        <Label>Días de la Semana</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={
                                selectedDays.includes(day.value)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleDaySelection(day.value)}
                            >
                              {day.label.slice(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ruleType === "seasonal" ||
                      ruleType === "special_date") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date">Fecha Inicio</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date">Fecha Fin</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Precio por Hora (MXN) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={pricePerHour}
                          onChange={(e) => setPricePerHour(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridad</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-active"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                      <Label htmlFor="is-active">Regla Activa</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setPriceDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePriceRule}>
                      {editingRule ? "Actualizar" : "Crear"} Regla
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-8">
                  Cargando reglas...
                </p>
              ) : priceRules.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay reglas de precio configuradas
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Precio/Hora</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {rule.rule_name}
                        </TableCell>
                        <TableCell>
                          {
                            RULE_TYPES.find((t) => t.value === rule.rule_type)
                              ?.label
                          }
                        </TableCell>
                        <TableCell>
                          {rule.start_time && rule.end_time
                            ? `${rule.start_time} - ${rule.end_time}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          $
                          {typeof rule.price_per_hour === "number"
                            ? rule.price_per_hour.toFixed(2)
                            : parseFloat(String(rule.price_per_hour)).toFixed(
                                2,
                              )}
                        </TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              rule.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.is_active ? "Activa" : "Inactiva"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPriceDialog(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePriceRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Horarios del Club por Día</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-8">
                  Cargando horarios...
                </p>
              ) : schedules.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay horarios configurados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Día</TableHead>
                      <TableHead>Hora Apertura</TableHead>
                      <TableHead>Hora Cierre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...schedules]
                      .sort((a, b) => a.day_of_week - b.day_of_week)
                      .map((schedule) => {
                        const dayInfo = DAYS_OF_WEEK.find(
                          (d) => d.value === schedule.day_of_week,
                        );
                        return (
                          <TableRow key={schedule.id}>
                            <TableCell className="font-medium">
                              {dayInfo?.label}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="time"
                                value={schedule.opens_at}
                                onChange={(e) =>
                                  handleUpdateSchedule(schedule.id, {
                                    opens_at: e.target.value,
                                  })
                                }
                                disabled={schedule.is_closed}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="time"
                                value={schedule.closes_at}
                                onChange={(e) =>
                                  handleUpdateSchedule(schedule.id, {
                                    closes_at: e.target.value,
                                  })
                                }
                                disabled={schedule.is_closed}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={!schedule.is_closed}
                                onCheckedChange={(checked) =>
                                  handleUpdateSchedule(schedule.id, {
                                    is_closed: !checked,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm text-gray-500">
                                {schedule.is_closed ? "Cerrado" : "Abierto"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
