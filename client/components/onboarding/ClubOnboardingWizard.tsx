import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Building2,
  Map,
  DollarSign,
  Settings,
  FileCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  goToStep,
  nextStep,
  previousStep,
  resetOnboarding,
} from "@/store/slices/clubOnboardingSlice";
import BasicInfoStep from "./steps/BasicInfoStep";
import CourtsStep from "./steps/CourtsStep";
import PricingHoursStep from "./steps/PricingHoursStep";
import OptionalFeaturesStep from "./steps/OptionalFeaturesStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";

const steps = [
  {
    number: 1,
    title: "Información Básica",
    subtitle: "Datos del club",
    icon: Building2,
    required: true,
  },
  {
    number: 2,
    title: "Canchas",
    subtitle: "Configuración de canchas",
    icon: Map,
    required: true,
  },
  {
    number: 3,
    title: "Precios y Horarios",
    subtitle: "Tarifas y disponibilidad",
    icon: DollarSign,
    required: true,
  },
  {
    number: 4,
    title: "Funciones Opcionales",
    subtitle: "Eventos, clases, suscripciones",
    icon: Settings,
    required: false,
  },
  {
    number: 5,
    title: "Revisar y Enviar",
    subtitle: "Confirma tu información",
    icon: FileCheck,
    required: true,
  },
];

export default function ClubOnboardingWizard() {
  const dispatch = useAppDispatch();
  const { currentStep, totalSteps, isSuccess } = useAppSelector(
    (state) => state.clubOnboarding,
  );

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      // Cleanup on unmount
    };
  }, []);

  const progress = (currentStep / totalSteps) * 100;

  const handleStepClick = (stepNumber: number) => {
    // Allow navigation to any previous step or current step
    if (stepNumber <= currentStep) {
      dispatch(goToStep(stepNumber));
    }
  };

  const handlePrevious = () => {
    dispatch(previousStep());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 flex items-center justify-center p-4 mt-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">
              ¡Solicitud Enviada Exitosamente!
            </h2>
            <p className="text-lg mb-6">
              Gracias por registrar tu club en Intelipadel. Nuestro equipo
              revisará tu información y se pondrá en contacto contigo en las
              próximas 24-48 horas.
            </p>
            <div className="bg-muted rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">Próximos Pasos:</h3>
              <ul className="text-left text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Revisión de tu información por nuestro equipo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Configuración de tu cuenta de administrador</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    Activación de tu club en la plataforma (24-48 horas)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Capacitación personalizada para tu equipo</span>
                </li>
              </ul>
            </div>
            <Button
              size="lg"
              onClick={() => {
                dispatch(resetOnboarding());
                window.location.href = "/";
              }}
            >
              Volver al Inicio
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/30 py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 px-2">
            Registra Tu Club en Intelipadel
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Completa el proceso de registro en 5 pasos simples. Tu club será
            revisado por nuestro equipo antes de activarse.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 md:mb-8 px-2">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs sm:text-sm text-center font-medium">
            Paso {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="mb-4 md:mb-8 px-1 sm:px-2">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isClickable = step.number <= currentStep;

              return (
                <button
                  key={step.number}
                  onClick={() => handleStepClick(step.number)}
                  disabled={!isClickable}
                  className={`relative p-2 sm:p-3 md:p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-lg"
                      : isCompleted
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                        : "border-muted bg-card hover:border-muted-foreground/20"
                  } ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      ) : (
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                          isActive
                            ? "text-primary"
                            : isCompleted
                              ? "text-primary/70"
                              : "text-muted-foreground"
                        }`}
                      >
                        <span className="hidden sm:inline">{step.title}</span>
                        <span className="sm:hidden">Paso {step.number}</span>
                      </p>
                      <p className="text-xs text-muted-foreground hidden lg:block">
                        {step.subtitle}
                      </p>
                      {step.required && (
                        <span className="text-xs text-destructive hidden sm:inline">
                          *
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <BasicInfoStep />}
            {currentStep === 2 && <CourtsStep />}
            {currentStep === 3 && <PricingHoursStep />}
            {currentStep === 4 && <OptionalFeaturesStep />}
            {currentStep === 5 && <ReviewSubmitStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
