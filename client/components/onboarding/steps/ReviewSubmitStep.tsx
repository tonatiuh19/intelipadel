import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  submitClubOnboarding,
  goToStep,
} from "@/store/slices/clubOnboardingSlice";
import {
  FileCheck,
  Building2,
  MapPin,
  Mail,
  Phone,
  Map,
  DollarSign,
  Clock,
  Calendar,
  Edit,
  Send,
  CheckCircle2,
  AlertCircle,
  Trophy,
  GraduationCap,
  Crown,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

const courtTypeLabels = {
  indoor: "Interior",
  outdoor: "Exterior",
  covered: "Techada",
};

const surfaceTypeLabels = {
  glass: "Cristal",
  concrete: "Concreto",
  artificial_grass: "Pasto Sintético",
};

const dayLabels: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

export default function ReviewSubmitStep() {
  const dispatch = useAppDispatch();
  const { data, isSubmitting, error } = useAppSelector(
    (state) => state.clubOnboarding,
  );

  const handleEdit = (step: number) => {
    dispatch(goToStep(step));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!data.name || !data.address || !data.email || !data.phone) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!data.courts || data.courts.length === 0) {
      alert("Debes agregar al menos una cancha");
      return;
    }

    // Submit the onboarding data
    dispatch(submitClubOnboarding(data as any));
  };

  const openDays = data.operating_hours?.filter((day) => !day.is_closed) || [];
  const closedDays = data.operating_hours?.filter((day) => day.is_closed) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Revisar y Enviar Solicitud
            </h2>
            <p className="text-xs sm:text-sm">
              Verifica que toda la información sea correcta antes de enviar
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Proceso de Revisión</p>
            <p>
              Una vez enviada tu solicitud, nuestro equipo de Intelipadel la
              revisará y se pondrá en contacto contigo en las próximas 24-48
              horas. Tu club permanecerá inactivo hasta que sea aprobado.
            </p>
          </div>
        </div>
      </Card>

      {/* Basic Info Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Información Básica
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(1)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Nombre del Club
              </p>
              <p className="font-semibold text-sm sm:text-base">{data.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Ciudad</p>
              <p className="font-semibold text-sm sm:text-base">
                {data.city}, {data.state}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Dirección
              </p>
              <p className="font-semibold text-xs sm:text-sm">{data.address}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Teléfono
              </p>
              <p className="font-semibold text-sm sm:text-base">{data.phone}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </p>
              <p className="font-semibold text-sm sm:text-base">{data.email}</p>
            </div>
            {data.website && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sitio Web
                </p>
                <p className="font-semibold text-xs sm:text-sm">
                  {data.website}
                </p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Descripción
              </p>
              <p className="text-xs sm:text-sm">{data.description}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Super Admin Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Super Administrador
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(1)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm mb-2 sm:mb-3">
              Esta persona tendrá acceso completo al panel de administración del
              club
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Nombre Completo
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {data.admin_name}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {data.admin_email}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Teléfono
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {data.admin_phone}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Courts Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Map className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Canchas ({data.courts?.length || 0})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(2)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {data.courts?.map((court, index) => (
              <div key={index} className="bg-muted rounded-lg p-3 sm:p-4">
                <p className="font-semibold mb-2 text-sm sm:text-base">
                  {court.name}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="bg-background px-2 py-1 rounded">
                    {courtTypeLabels[court.court_type]}
                  </span>
                  <span className="bg-background px-2 py-1 rounded">
                    {surfaceTypeLabels[court.surface_type]}
                  </span>
                  {court.has_lighting && (
                    <span className="bg-background px-2 py-1 rounded">
                      Con iluminación
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Pricing & Hours Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Precios y Horarios
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(3)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Precio por Hora
              </p>
              <p className="text-xl sm:text-2xl font-bold text-muted">
                ${data.price_per_hour} {data.currency}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Duración Estándar
              </p>
              <p className="text-base sm:text-lg font-semibold">
                {data.default_booking_duration} minutos
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Moneda</p>
              <p className="text-base sm:text-lg font-semibold">
                {data.currency}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Horarios de Operación
            </p>
            <div className="flex flex-wrap gap-2">
              {openDays.map((day) => (
                <div
                  key={day.day_of_week}
                  className="bg-muted rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                >
                  <span className="font-semibold">
                    {dayLabels[day.day_of_week]}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {day.open_time} - {day.close_time}
                  </span>
                </div>
              ))}
            </div>
            {closedDays.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Días cerrados:{" "}
                {closedDays.map((d) => dayLabels[d.day_of_week]).join(", ")}
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Optional Features Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Funciones Opcionales
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(4)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            <div
              className={`p-3 sm:p-4 rounded-lg border-2 ${
                data.enable_events
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted"
              }`}
            >
              <Trophy
                className={`h-5 w-5 mb-2 ${
                  data.enable_events ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold text-sm">Eventos y Torneos</p>
              <p
                className={`text-xs ${
                  data.enable_events ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {data.enable_events ? "Activado" : "Desactivado"}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border-2 ${
                data.enable_classes
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted"
              }`}
            >
              <GraduationCap
                className={`h-5 w-5 mb-2 ${
                  data.enable_classes ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold text-sm">Clases Privadas</p>
              <p
                className={`text-xs ${
                  data.enable_classes ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {data.enable_classes ? "Activado" : "Desactivado"}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border-2 ${
                data.enable_subscriptions
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted"
              }`}
            >
              <Crown
                className={`h-5 w-5 mb-2 ${
                  data.enable_subscriptions
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold text-sm">Suscripciones</p>
              <p
                className={`text-xs ${
                  data.enable_subscriptions
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {data.enable_subscriptions ? "Activado" : "Desactivado"}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Submit Button */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <p className="text-center text-sm sm:text-base text-muted-foreground max-w-2xl">
            Al enviar esta solicitud, confirmas que toda la información
            proporcionada es correcta. El equipo de Intelipadel la revisará y se
            pondrá en contacto contigo pronto.
          </p>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[300px] text-base sm:text-lg py-5 sm:py-6"
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
