import { Formik, Form, Field } from "formik";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateOptionalFeatures,
  nextStep,
  previousStep,
} from "@/store/slices/clubOnboardingSlice";
import {
  Settings,
  Trophy,
  GraduationCap,
  Crown,
  FileText,
  Shield,
  Info,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OptionalFeaturesStep() {
  const dispatch = useAppDispatch();
  const onboardingData = useAppSelector((state) => state.clubOnboarding.data);

  const handleSubmit = (values: any) => {
    dispatch(updateOptionalFeatures(values));
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const features = [
    {
      name: "enable_events",
      title: "Eventos y Torneos",
      description:
        "Organiza torneos, ligas y eventos especiales con inscripción y pagos integrados",
      icon: Trophy,
      benefits: [
        "Gestión completa de torneos",
        "Control de inscripciones y pagos",
        "Asignación de múltiples canchas",
        "Límites de participantes",
      ],
    },
    {
      name: "enable_classes",
      title: "Clases Privadas",
      description:
        "Sistema completo para gestionar instructores y clases individuales o grupales",
      icon: GraduationCap,
      benefits: [
        "Gestión de instructores",
        "Disponibilidad de horarios",
        "Reservas de clases",
        "Seguimiento de pagos",
      ],
    },
    {
      name: "enable_subscriptions",
      title: "Membresías y Suscripciones",
      description:
        "Crea planes de membresía mensuales con beneficios y descuentos exclusivos",
      icon: Crown,
      benefits: [
        "Planes de suscripción personalizados",
        "Descuentos automáticos",
        "Beneficios exclusivos",
        "Pagos recurrentes",
      ],
    },
  ];

  return (
    <Card className="p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Funciones Opcionales
            </h2>
            <p className="text-xs sm:text-sm">
              Activa funciones adicionales para tu club (puedes configurarlas
              más tarde)
            </p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={{
          enable_events: onboardingData.enable_events || false,
          enable_classes: onboardingData.enable_classes || false,
          enable_subscriptions: onboardingData.enable_subscriptions || false,
          terms_and_conditions: onboardingData.terms_and_conditions || "",
          privacy_policy: onboardingData.privacy_policy || "",
          cancellation_policy: onboardingData.cancellation_policy || "",
        }}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className="space-y-4 sm:space-y-6">
              {/* Optional Features */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                  Funciones Avanzadas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const isEnabled = values[
                      feature.name as keyof typeof values
                    ] as boolean;

                    return (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`p-6 cursor-pointer transition-all ${
                            isEnabled
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() =>
                            setFieldValue(feature.name, !isEnabled)
                          }
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isEnabled
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-secondary">
                                  {feature.title}
                                </h4>
                                {isEnabled && (
                                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                          <ul className="space-y-1 mt-3">
                            {feature.benefits.map((benefit, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-muted-foreground flex items-center gap-2"
                              >
                                <span className="w-1 h-1 bg-primary rounded-full"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4">
                            <Label className="flex items-center gap-2 cursor-pointer">
                              <Field
                                type="checkbox"
                                name={feature.name}
                                className="h-4 w-4 rounded"
                              />
                              <span className="text-sm">
                                {isEnabled ? "Activado" : "Activar"}
                              </span>
                            </Label>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      No te preocupes por configurar todo ahora
                    </p>
                    <p>
                      Puedes activar o desactivar estas funciones en cualquier
                      momento desde el panel de administración. También podrás
                      configurarlas en detalle después de que tu club sea
                      aprobado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Policies Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Políticas del Club (Opcional)
                </h3>
                <p className="text-sm mb-4">
                  Puedes agregar tus políticas ahora o configurarlas más tarde
                  desde el panel de administración. <strong>Nota:</strong> Estas
                  políticas serán requeridas para activar tu club.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="terms_and_conditions"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Términos y Condiciones
                    </Label>
                    <Field
                      as={Textarea}
                      id="terms_and_conditions"
                      name="terms_and_conditions"
                      rows={4}
                      placeholder="Términos y condiciones de uso de tu club (opcional)..."
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="privacy_policy"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Política de Privacidad
                    </Label>
                    <Field
                      as={Textarea}
                      id="privacy_policy"
                      name="privacy_policy"
                      rows={4}
                      placeholder="Política de privacidad y manejo de datos (opcional)..."
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="cancellation_policy"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Política de Cancelación
                    </Label>
                    <Field
                      as={Textarea}
                      id="cancellation_policy"
                      name="cancellation_policy"
                      rows={4}
                      placeholder="Política de cancelación y reembolsos (opcional)..."
                    />
                    <p className="text-xs mt-1">
                      Ej: "Cancelaciones con al menos 24 horas de anticipación
                      reciben reembolso completo"
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    dispatch(previousStep());
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto"
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  Continuar a Revisión
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
