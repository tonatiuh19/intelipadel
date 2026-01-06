import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Calendar,
  Shield,
  Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import FeeStructureTermsDialog from "../FeeStructureTermsDialog";
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
  getFeeStructure,
  updateFeeStructure,
  getClubColors,
  updateClubColors,
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
    feeStructure,
    clubColors,
    isLoading,
    isSubmitting,
  } = useAppSelector((state) => state.adminSettings);
  const { toast } = useToast();

  const [localBasePrice, setLocalBasePrice] = useState<number>(basePrice);
  const [localDefaultDuration, setLocalDefaultDuration] =
    useState<number>(defaultDuration);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [pendingFeeStructure, setPendingFeeStructure] = useState<{
    fee_structure: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
    service_fee_percentage: number;
  } | null>(null);

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
        dispatch(getFeeStructure()).unwrap(),
        dispatch(getClubColors()).unwrap(),
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
        <h1 className="text-3xl font-bold text-primary">Configuración</h1>
        <p className="mt-1">
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
          <TabsTrigger value="fee-structure">
            <Shield className="h-4 w-4 mr-2" />
            Estructura de Comisión
          </TabsTrigger>
          {/* <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colores del Club
          </TabsTrigger> */}
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

        {/* Fee Structure Tab */}
        <TabsContent value="fee-structure">
          <Card>
            <CardHeader>
              <CardTitle>Estructura de Comisión de InteliPadel</CardTitle>
              <p className="text-sm  mt-2">
                Define cómo se aplicará la comisión de servicio no reembolsable
                de InteliPadel en las reservas de tu club.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-8">
                  Cargando configuración...
                </p>
              ) : (
                <Formik
                  initialValues={{
                    fee_structure:
                      feeStructure?.fee_structure || "user_pays_fee",
                  }}
                  enableReinitialize
                  validationSchema={Yup.object({
                    fee_structure: Yup.string()
                      .oneOf([
                        "user_pays_fee",
                        "shared_fee",
                        "club_absorbs_fee",
                      ])
                      .required("Selecciona una estructura de comisión"),
                  })}
                  onSubmit={async (values, { setSubmitting }) => {
                    // Check if fee_structure changed - requires terms
                    if (values.fee_structure !== feeStructure?.fee_structure) {
                      // Show terms dialog
                      setPendingFeeStructure({
                        fee_structure: values.fee_structure as any,
                        service_fee_percentage:
                          feeStructure?.service_fee_percentage || 8.0,
                      });
                      setTermsDialogOpen(true);
                      setSubmitting(false);
                      return;
                    }

                    // Update directly (no changes, just re-confirm)
                    try {
                      await dispatch(
                        updateFeeStructure({
                          fee_structure: values.fee_structure as any,
                        }),
                      ).unwrap();

                      toast({
                        title: "Configuración actualizada",
                        description:
                          "La estructura de comisión se ha guardado correctamente",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description:
                          error || "No se pudo actualizar la configuración",
                        variant: "destructive",
                      });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({
                    values,
                    setFieldValue,
                    isSubmitting: formSubmitting,
                  }) => {
                    const serviceFeePercentage =
                      feeStructure?.service_fee_percentage || 8.0;

                    return (
                      <Form className="space-y-6">
                        {/* Current configuration summary */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                          <p className="text-sm font-medium text-blue-900">
                            Comisión de servicio InteliPadel:{" "}
                            {serviceFeePercentage}%
                          </p>
                          <p className="text-xs text-blue-700">
                            Este porcentaje es establecido por InteliPadel y no
                            puede ser modificado.
                          </p>
                        </div>

                        {feeStructure?.fee_terms_accepted_at && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                              ✓ Términos aceptados el{" "}
                              {new Date(
                                feeStructure.fee_terms_accepted_at,
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        {/* Fee Structure Options */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">
                            Tipo de Estructura *
                          </Label>

                          {/* Option 1: User Pays Fee */}
                          <div
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              values.fee_structure === "user_pays_fee"
                                ? "border-primary bg-muted"
                                : "border-gray-200 hover:border-primary"
                            }`}
                            onClick={() =>
                              setFieldValue("fee_structure", "user_pays_fee")
                            }
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="fee_structure"
                                value="user_pays_fee"
                                checked={
                                  values.fee_structure === "user_pays_fee"
                                }
                                onChange={() =>
                                  setFieldValue(
                                    "fee_structure",
                                    "user_pays_fee",
                                  )
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold  mb-1">
                                  Usuario Paga Comisión Completa
                                </h4>
                                <p className="text-sm  mb-2">
                                  El usuario paga el precio de la reserva más la
                                  comisión de servicio.
                                </p>
                                <div className="bg-secondary rounded p-3 text-sm border space-y-1">
                                  <p className="font-medium ">Ejemplo:</p>
                                  <p>Precio de reserva: $750.00</p>
                                  <p>
                                    Comisión de servicio ({serviceFeePercentage}
                                    %): $
                                    {(
                                      (750 * serviceFeePercentage) /
                                      100
                                    ).toFixed(2)}
                                  </p>
                                  <p className="border-t pt-1 mt-1">
                                    Subtotal: $
                                    {(
                                      750 +
                                      (750 * serviceFeePercentage) / 100
                                    ).toFixed(2)}
                                  </p>
                                  <p>
                                    IVA (16%): $
                                    {(
                                      (750 +
                                        (750 * serviceFeePercentage) / 100) *
                                      0.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    └ IVA sobre reserva: $
                                    {(750 * 0.16).toFixed(2)}
                                    <br />└ IVA sobre comisión: $
                                    {(
                                      ((750 * serviceFeePercentage) / 100) *
                                      0.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="font-semibold text-primary border-t pt-1 mt-1">
                                    Total a pagar: $
                                    {(
                                      (750 +
                                        (750 * serviceFeePercentage) / 100) *
                                      1.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-green-700 font-medium border-t pt-1 mt-1">
                                    Club recibe: ${(750 * 1.16).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    ($750.00 + $120.00 IVA)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Option 2: Shared Fee */}
                          <div
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              values.fee_structure === "shared_fee"
                                ? "border-primary bg-muted"
                                : "border-gray-200 hover:border-primary"
                            }`}
                            onClick={() =>
                              setFieldValue("fee_structure", "shared_fee")
                            }
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="fee_structure"
                                value="shared_fee"
                                checked={values.fee_structure === "shared_fee"}
                                onChange={() =>
                                  setFieldValue("fee_structure", "shared_fee")
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold  mb-1">
                                  Comisión Compartida 50/50
                                </h4>
                                <p className="text-sm  mb-2">
                                  El usuario y el club comparten la comisión al
                                  50% cada uno.
                                </p>
                                <div className="bg-secondary rounded p-3 text-sm border space-y-1">
                                  <p className="font-medium ">Ejemplo:</p>
                                  <p>Precio de reserva: $750.00</p>
                                  <p>
                                    Comisión total ({serviceFeePercentage}%): $
                                    {(
                                      (750 * serviceFeePercentage) /
                                      100
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    └ Usuario paga 50%: $
                                    {(
                                      (750 * serviceFeePercentage) /
                                      100 /
                                      2
                                    ).toFixed(2)}
                                    <br />└ Club paga 50%: $
                                    {(
                                      (750 * serviceFeePercentage) /
                                      100 /
                                      2
                                    ).toFixed(2)}
                                  </p>
                                  <p className="border-t pt-1 mt-1">
                                    Subtotal: $
                                    {(
                                      750 +
                                      (750 * serviceFeePercentage) / 100 / 2
                                    ).toFixed(2)}
                                  </p>
                                  <p>
                                    IVA (16%): $
                                    {(
                                      (750 +
                                        (750 * serviceFeePercentage) /
                                          100 /
                                          2) *
                                      0.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    └ IVA sobre reserva: $
                                    {(750 * 0.16).toFixed(2)}
                                    <br />└ IVA sobre comisión (50%): $
                                    {(
                                      ((750 * serviceFeePercentage) / 100 / 2) *
                                      0.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="font-semibold text-primary border-t pt-1 mt-1">
                                    Total a pagar: $
                                    {(
                                      (750 +
                                        (750 * serviceFeePercentage) /
                                          100 /
                                          2) *
                                      1.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-green-700 font-medium border-t pt-1 mt-1">
                                    Club recibe: $
                                    {(
                                      (750 -
                                        (750 * serviceFeePercentage) /
                                          100 /
                                          2) *
                                      1.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    ($
                                    {(
                                      750 -
                                      (750 * serviceFeePercentage) / 100 / 2
                                    ).toFixed(2)}{" "}
                                    + $
                                    {(
                                      (750 -
                                        (750 * serviceFeePercentage) /
                                          100 /
                                          2) *
                                      0.16
                                    ).toFixed(2)}{" "}
                                    IVA)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Option 3: Club Absorbs Fee */}
                          <div
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              values.fee_structure === "club_absorbs_fee"
                                ? "border-primary bg-muted"
                                : "border-gray-200 hover:border-primary"
                            }`}
                            onClick={() =>
                              setFieldValue("fee_structure", "club_absorbs_fee")
                            }
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="fee_structure"
                                value="club_absorbs_fee"
                                checked={
                                  values.fee_structure === "club_absorbs_fee"
                                }
                                onChange={() =>
                                  setFieldValue(
                                    "fee_structure",
                                    "club_absorbs_fee",
                                  )
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold  mb-1">
                                  Club Absorbe Comisión (Predeterminado)
                                </h4>
                                <p className="text-sm  mb-2">
                                  La comisión está incluida en el precio
                                  mostrado. El club paga la comisión completa.
                                </p>
                                <div className="bg-secondary rounded p-3 text-sm border space-y-1">
                                  <p className="font-medium ">Ejemplo:</p>
                                  <p>Precio mostrado: $750.00</p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    (comisión incluida)
                                  </p>
                                  <p className="border-t pt-1 mt-1">
                                    Subtotal: $750.00
                                  </p>
                                  <p>IVA (16%): ${(750 * 0.16).toFixed(2)}</p>
                                  <p className="font-semibold text-primary border-t pt-1 mt-1">
                                    Total a pagar: ${(750 * 1.16).toFixed(2)}
                                  </p>
                                  <p className="text-green-700 font-medium border-t pt-1 mt-1">
                                    Club recibe: $
                                    {(
                                      (750 -
                                        (750 * serviceFeePercentage) / 100) *
                                      1.16
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-4">
                                    ($
                                    {(
                                      750 -
                                      (750 * serviceFeePercentage) / 100
                                    ).toFixed(2)}{" "}
                                    + $
                                    {(
                                      (750 -
                                        (750 * serviceFeePercentage) / 100) *
                                      0.16
                                    ).toFixed(2)}{" "}
                                    IVA)
                                    <br />
                                    Club paga comisión: $
                                    {(
                                      ((750 * serviceFeePercentage) / 100) *
                                      1.16
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <ErrorMessage
                            name="fee_structure"
                            component="div"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Important notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-900 font-medium mb-2">
                            ⚠️ Información Importante
                          </p>
                          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                            <li>
                              La comisión de servicio es{" "}
                              <strong>no reembolsable</strong>
                            </li>
                            <li>
                              Cambiar la estructura de comisión requiere aceptar
                              nuevamente los términos
                            </li>
                            <li>
                              Los cambios afectan a todas las reservas futuras
                            </li>
                          </ul>
                        </div>

                        <Button
                          type="submit"
                          disabled={formSubmitting || isSubmitting}
                          className="w-full"
                        >
                          {formSubmitting || isSubmitting
                            ? "Guardando..."
                            : "Guardar Configuración"}
                        </Button>
                      </Form>
                    );
                  }}
                </Formik>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Personalización de Colores</CardTitle>
              <p className="text-sm  mt-2">
                Personaliza los colores de tu marca que se aplicarán al CRM y al
                asistente de reservas.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-8">
                  Cargando configuración de colores...
                </p>
              ) : (
                <Formik
                  initialValues={{
                    primary_color: clubColors?.primary_color || "#ea580c",
                    secondary_color: clubColors?.secondary_color || "#fb923c",
                    accent_color: clubColors?.accent_color || "#fed7aa",
                    text_color: clubColors?.text_color || "#1f2937",
                    background_color: clubColors?.background_color || "#ffffff",
                  }}
                  enableReinitialize
                  validationSchema={Yup.object({
                    primary_color: Yup.string()
                      .matches(
                        /^#[0-9A-F]{6}$/i,
                        "Debe ser un color hexadecimal válido (#RRGGBB)",
                      )
                      .required("El color primario es requerido"),
                    secondary_color: Yup.string()
                      .matches(
                        /^#[0-9A-F]{6}$/i,
                        "Debe ser un color hexadecimal válido (#RRGGBB)",
                      )
                      .required("El color secundario es requerido"),
                    accent_color: Yup.string()
                      .matches(
                        /^#[0-9A-F]{6}$/i,
                        "Debe ser un color hexadecimal válido (#RRGGBB)",
                      )
                      .required("El color de acento es requerido"),
                    text_color: Yup.string()
                      .matches(
                        /^#[0-9A-F]{6}$/i,
                        "Debe ser un color hexadecimal válido (#RRGGBB)",
                      )
                      .required("El color de texto es requerido"),
                    background_color: Yup.string()
                      .matches(
                        /^#[0-9A-F]{6}$/i,
                        "Debe ser un color hexadecimal válido (#RRGGBB)",
                      )
                      .required("El color de fondo es requerido"),
                  })}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      await dispatch(updateClubColors(values)).unwrap();

                      toast({
                        title: "Colores actualizados",
                        description:
                          "Los colores de tu club se han guardado correctamente",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description:
                          error || "No se pudieron actualizar los colores",
                        variant: "destructive",
                      });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({
                    values,
                    setFieldValue,
                    isSubmitting: formSubmitting,
                  }) => (
                    <Form className="space-y-8">
                      {/* Color Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Color */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="primary_color"
                            className="text-base font-semibold"
                          >
                            Color Primario
                          </Label>
                          <p className="text-sm ">
                            Color principal de tu marca (botones, enlaces
                            principales)
                          </p>
                          <div className="flex gap-3 items-center">
                            <Field name="primary_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="color"
                                  className="h-16 w-24 cursor-pointer"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "primary_color",
                                      e.target.value,
                                    );
                                  }}
                                />
                              )}
                            </Field>
                            <Field name="primary_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="#ea580c"
                                  className="flex-1 font-mono"
                                  maxLength={7}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage
                            name="primary_color"
                            component="div"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="secondary_color"
                            className="text-base font-semibold"
                          >
                            Color Secundario
                          </Label>
                          <p className="text-sm ">
                            Color de soporte y elementos secundarios
                          </p>
                          <div className="flex gap-3 items-center">
                            <Field name="secondary_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="color"
                                  className="h-16 w-24 cursor-pointer"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "secondary_color",
                                      e.target.value,
                                    );
                                  }}
                                />
                              )}
                            </Field>
                            <Field name="secondary_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="#fb923c"
                                  className="flex-1 font-mono"
                                  maxLength={7}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage
                            name="secondary_color"
                            component="div"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="accent_color"
                            className="text-base font-semibold"
                          >
                            Color de Acento
                          </Label>
                          <p className="text-sm ">
                            Color para destacar información importante
                          </p>
                          <div className="flex gap-3 items-center">
                            <Field name="accent_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="color"
                                  className="h-16 w-24 cursor-pointer"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "accent_color",
                                      e.target.value,
                                    );
                                  }}
                                />
                              )}
                            </Field>
                            <Field name="accent_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="#fed7aa"
                                  className="flex-1 font-mono"
                                  maxLength={7}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage
                            name="accent_color"
                            component="div"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Text Color */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="text_color"
                            className="text-base font-semibold"
                          >
                            Color de Texto
                          </Label>
                          <p className="text-sm ">Color principal del texto</p>
                          <div className="flex gap-3 items-center">
                            <Field name="text_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="color"
                                  className="h-16 w-24 cursor-pointer"
                                  onChange={(e) => {
                                    setFieldValue("text_color", e.target.value);
                                  }}
                                />
                              )}
                            </Field>
                            <Field name="text_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="#1f2937"
                                  className="flex-1 font-mono"
                                  maxLength={7}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage
                            name="text_color"
                            component="div"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Background Color */}
                        <div className="space-y-2 md:col-span-2">
                          <Label
                            htmlFor="background_color"
                            className="text-base font-semibold"
                          >
                            Color de Fondo
                          </Label>
                          <p className="text-sm ">
                            Color de fondo principal de la interfaz
                          </p>
                          <div className="flex gap-3 items-center max-w-md">
                            <Field name="background_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="color"
                                  className="h-16 w-24 cursor-pointer"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "background_color",
                                      e.target.value,
                                    );
                                  }}
                                />
                              )}
                            </Field>
                            <Field name="background_color">
                              {({ field }: any) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="#ffffff"
                                  className="flex-1 font-mono"
                                  maxLength={7}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage
                            name="background_color"
                            component="div"
                            className="text-sm text-red-600"
                          />
                        </div>
                      </div>

                      {/* Preview Section */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Vista Previa
                        </h3>
                        <div
                          className="rounded-lg border-2 p-8 space-y-4 transition-colors duration-300"
                          style={{
                            backgroundColor: values.background_color,
                            color: values.text_color,
                          }}
                        >
                          <div className="space-y-2">
                            <h4
                              className="text-2xl font-bold transition-colors duration-300"
                              style={{ color: values.primary_color }}
                            >
                              Bienvenido a tu Club
                            </h4>
                            <p style={{ color: values.text_color }}>
                              Este es un ejemplo de cómo se verán los colores de
                              tu marca en la interfaz.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              className="px-6 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
                              style={{
                                backgroundColor: values.primary_color,
                                color: "#ffffff",
                              }}
                            >
                              Botón Primario
                            </button>
                            <button
                              type="button"
                              className="px-6 py-2 rounded-lg font-semibold transition-transform hover:scale-105"
                              style={{
                                backgroundColor: values.secondary_color,
                                color: "#ffffff",
                              }}
                            >
                              Botón Secundario
                            </button>
                            <div
                              className="px-6 py-2 rounded-lg font-semibold"
                              style={{
                                backgroundColor: values.accent_color,
                                color: values.text_color,
                              }}
                            >
                              Etiqueta de Acento
                            </div>
                          </div>

                          <div
                            className="border rounded-lg p-4 mt-4"
                            style={{
                              borderColor: values.primary_color,
                              backgroundColor: values.background_color,
                            }}
                          >
                            <h5
                              className="font-semibold mb-2"
                              style={{ color: values.primary_color }}
                            >
                              Tarjeta de Ejemplo
                            </h5>
                            <p
                              className="text-sm"
                              style={{ color: values.text_color }}
                            >
                              Los elementos de tu interfaz utilizarán estos
                              colores para mantener la identidad visual de tu
                              club.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info Notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900 font-medium mb-2">
                          💡 Consejos para elegir colores
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>
                            Usa colores que representen la identidad de tu club
                          </li>
                          <li>
                            Asegúrate de que el texto sea legible sobre el fondo
                            elegido
                          </li>
                          <li>
                            Los cambios se aplicarán inmediatamente al guardar
                          </li>
                          <li>
                            Puedes restablecer los colores predeterminados en
                            cualquier momento
                          </li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        disabled={formSubmitting || isSubmitting}
                        className="w-full"
                      >
                        {formSubmitting || isSubmitting
                          ? "Guardando..."
                          : "Guardar Colores"}
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Terms Acceptance Dialog */}
      {pendingFeeStructure && (
        <FeeStructureTermsDialog
          open={termsDialogOpen}
          onOpenChange={(open) => {
            setTermsDialogOpen(open);
            if (!open) {
              setPendingFeeStructure(null);
            }
          }}
          onAccept={async () => {
            try {
              await dispatch(
                updateFeeStructure({
                  fee_structure: pendingFeeStructure.fee_structure,
                  service_fee_percentage:
                    pendingFeeStructure.service_fee_percentage,
                  terms_accepted: true,
                }),
              ).unwrap();

              toast({
                title: "Configuración actualizada",
                description:
                  "La estructura de comisión se ha guardado correctamente",
              });

              setTermsDialogOpen(false);
              setPendingFeeStructure(null);
            } catch (error: any) {
              toast({
                title: "Error",
                description: error || "No se pudo actualizar la configuración",
                variant: "destructive",
              });
            }
          }}
          isLoading={isSubmitting}
          feeStructure={pendingFeeStructure.fee_structure}
          serviceFeePercentage={pendingFeeStructure.service_fee_percentage}
        />
      )}
    </div>
  );
}
