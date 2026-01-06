import { useState, useEffect } from "react";
import {
  ClubSubscription,
  CreateSubscriptionData,
  SubscriptionExtra,
} from "@shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  X,
  CreditCard,
  Percent,
  Gift,
  Crown,
  Check,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormik } from "formik";
import * as Yup from "yup";

interface SubscriptionWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubscriptionData) => Promise<void>;
  editingSubscription?: ClubSubscription | null;
  clubId: number;
}

// Validation Schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: Yup.string().max(
    500,
    "La descripción no puede exceder 500 caracteres",
  ),
  price_monthly: Yup.number()
    .required("El precio es requerido")
    .positive("El precio debe ser mayor a 0")
    .max(100000, "El precio no puede exceder $100,000"),
  currency: Yup.string()
    .required("La moneda es requerida")
    .equals(["MXN"], "Solo se acepta MXN como moneda"),
  booking_discount_percent: Yup.number()
    .nullable()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede exceder 100%")
    .test(
      "mutually-exclusive",
      "No puedes tener descuento Y créditos al mismo tiempo",
      function (value) {
        const { booking_credits_monthly } = this.parent;
        if (value && booking_credits_monthly) return false;
        return true;
      },
    ),
  booking_credits_monthly: Yup.number()
    .nullable()
    .integer("Los créditos deben ser un número entero")
    .min(0, "Los créditos no pueden ser negativos")
    .max(100, "Los créditos no pueden exceder 100")
    .test(
      "mutually-exclusive",
      "No puedes tener créditos Y descuento al mismo tiempo",
      function (value) {
        const { booking_discount_percent } = this.parent;
        if (value && booking_discount_percent) return false;
        return true;
      },
    ),
  bar_discount_percent: Yup.number()
    .nullable()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede exceder 100%"),
  merch_discount_percent: Yup.number()
    .nullable()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede exceder 100%"),
  event_discount_percent: Yup.number()
    .nullable()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede exceder 100%"),
  class_discount_percent: Yup.number()
    .nullable()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede exceder 100%"),
  max_subscribers: Yup.number()
    .nullable()
    .integer("Debe ser un número entero")
    .positive("Debe ser un número positivo"),
  display_order: Yup.number()
    .integer("Debe ser un número entero")
    .min(0, "Debe ser mayor o igual a 0"),
  is_active: Yup.boolean(),
  extras: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      description: Yup.string().required(),
    }),
  ),
});

export default function SubscriptionWizard({
  open,
  onClose,
  onSubmit,
  editingSubscription,
  clubId,
}: SubscriptionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [newExtra, setNewExtra] = useState("");

  const formik = useFormik<CreateSubscriptionData>({
    initialValues: editingSubscription
      ? {
          club_id: editingSubscription.club_id,
          name: editingSubscription.name,
          description: editingSubscription.description || "",
          price_monthly: editingSubscription.price_monthly,
          currency: editingSubscription.currency,
          booking_discount_percent:
            editingSubscription.booking_discount_percent,
          booking_credits_monthly: editingSubscription.booking_credits_monthly,
          bar_discount_percent: editingSubscription.bar_discount_percent,
          merch_discount_percent: editingSubscription.merch_discount_percent,
          event_discount_percent: editingSubscription.event_discount_percent,
          class_discount_percent: editingSubscription.class_discount_percent,
          extras: (editingSubscription.extras || []).map((extra) =>
            typeof extra === "string"
              ? { id: crypto.randomUUID(), description: extra }
              : extra,
          ) as SubscriptionExtra[],
          is_active: editingSubscription.is_active,
          display_order: editingSubscription.display_order,
          max_subscribers: editingSubscription.max_subscribers,
        }
      : {
          club_id: clubId,
          name: "",
          description: "",
          price_monthly: 0,
          currency: "MXN",
          booking_discount_percent: undefined,
          booking_credits_monthly: undefined,
          bar_discount_percent: undefined,
          merch_discount_percent: undefined,
          event_discount_percent: undefined,
          class_discount_percent: undefined,
          extras: [],
          is_active: true,
          display_order: 0,
          max_subscribers: undefined,
        },
    enableReinitialize: true,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await onSubmit(values);
      handleClose();
    },
  });

  // Reset step when dialog opens or editingSubscription changes
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setNewExtra("");
    }
  }, [open, editingSubscription]);

  const wizardSteps = [
    { id: 1, name: "Información Básica", icon: CreditCard },
    { id: 2, name: "Beneficios Reservas", icon: CreditCard },
    { id: 3, name: "Descuentos", icon: Percent },
    { id: 4, name: "Extras", icon: Gift },
    { id: 5, name: "Configuración", icon: Crown },
  ];

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddExtra = () => {
    if (!newExtra.trim()) return;
    const extra: SubscriptionExtra = {
      id: crypto.randomUUID(),
      description: newExtra.trim(),
    };
    formik.setFieldValue("extras", [...(formik.values.extras || []), extra]);
    setNewExtra("");
  };

  const handleRemoveExtra = (extraId: string) => {
    formik.setFieldValue(
      "extras",
      (formik.values.extras || []).filter((e) => e.id !== extraId),
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          formik.values.name.trim() &&
          formik.values.price_monthly > 0 &&
          !formik.errors.name &&
          !formik.errors.price_monthly &&
          !formik.errors.currency
        );
      case 1:
        return (
          !formik.errors.booking_discount_percent &&
          !formik.errors.booking_credits_monthly
        );
      case 2:
        return (
          !formik.errors.bar_discount_percent &&
          !formik.errors.merch_discount_percent &&
          !formik.errors.event_discount_percent &&
          !formik.errors.class_discount_percent
        );
      case 3:
        return true;
      case 4:
        return !formik.errors.max_subscribers && !formik.errors.display_order;
      default:
        return true;
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setNewExtra("");
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Wizard Header */}
        <div className="p-6 border-b bg-muted/30">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-6">
            {editingSubscription ? "Editar" : "Crear"} Suscripción
          </DialogTitle>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-lg"
                          : isCompleted
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center transition-colors duration-300 hidden sm:block max-w-[80px] ${
                        isActive
                          ? "text-primary font-bold"
                          : isCompleted
                            ? "text-green-600 font-semibold"
                            : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-500"
                          : isActive
                            ? "bg-primary"
                            : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Paso 1: Información Básica
                    </p>
                    <p>
                      Define el nombre, precio y moneda de tu plan de
                      suscripción.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre de la Suscripción *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: Plan Premium, Plan Básico"
                    className="mt-2 h-11 px-4"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-sm text-red-600 mt-1.5">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Describe los beneficios principales de esta suscripción..."
                    rows={4}
                    className="mt-2 px-4 py-3"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-sm text-red-600 mt-1.5">
                      {formik.errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="price_monthly"
                      className="text-sm font-medium"
                    >
                      Precio Mensual * ($)
                    </Label>
                    <Input
                      id="price_monthly"
                      name="price_monthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formik.values.price_monthly || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.price_monthly &&
                      formik.errors.price_monthly && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.price_monthly}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-sm font-medium">
                      Moneda
                    </Label>
                    <Input
                      id="currency"
                      name="currency"
                      value={formik.values.currency}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled
                      className="mt-2 h-11 px-4 bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Solo se acepta MXN
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Booking Benefits */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Paso 2: Beneficios en Reservas
                    </p>
                    <p>
                      Elige entre descuento porcentual o créditos mensuales. Son
                      mutuamente excluyentes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-5 border-2 rounded-lg transition-all ${
                      formik.values.booking_discount_percent
                        ? "border-primary bg-muted"
                        : formik.values.booking_credits_monthly
                          ? "border-gray-200 bg-gray-50 opacity-50"
                          : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    <Label
                      htmlFor="booking_discount_percent"
                      className="text-base font-semibold"
                    >
                      Descuento Porcentual
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      Descuento aplicado al precio de las reservas
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="booking_discount_percent"
                        name="booking_discount_percent"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formik.values.booking_discount_percent || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          formik.setFieldValue(
                            "booking_discount_percent",
                            value,
                          );
                          if (value) {
                            formik.setFieldValue(
                              "booking_credits_monthly",
                              undefined,
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="0"
                        disabled={!!formik.values.booking_credits_monthly}
                        className="h-11 px-4"
                      />
                      <span className="text-gray-600 font-semibold">%</span>
                    </div>
                    {formik.touched.booking_discount_percent &&
                      formik.errors.booking_discount_percent && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.booking_discount_percent}
                        </p>
                      )}
                  </div>

                  <div
                    className={`p-5 border-2 rounded-lg transition-all ${
                      formik.values.booking_credits_monthly
                        ? "border-blue-500 bg-blue-50"
                        : formik.values.booking_discount_percent
                          ? "border-gray-200 bg-gray-50 opacity-50"
                          : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <Label
                      htmlFor="booking_credits_monthly"
                      className="text-base font-semibold"
                    >
                      Créditos Mensuales
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      Número de reservas gratis por mes
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="booking_credits_monthly"
                        name="booking_credits_monthly"
                        type="number"
                        min="0"
                        max="100"
                        value={formik.values.booking_credits_monthly || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : undefined;
                          formik.setFieldValue(
                            "booking_credits_monthly",
                            value,
                          );
                          if (value) {
                            formik.setFieldValue(
                              "booking_discount_percent",
                              undefined,
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="0"
                        disabled={!!formik.values.booking_discount_percent}
                        className="h-11 px-4"
                      />
                      <span className="text-gray-600 font-semibold">
                        créditos
                      </span>
                    </div>
                    {formik.touched.booking_credits_monthly &&
                      formik.errors.booking_credits_monthly && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.booking_credits_monthly}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Discounts */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Paso 3: Descuentos Adicionales
                    </p>
                    <p>
                      Configura descuentos para otros servicios del club (todos
                      opcionales).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="bar_discount_percent"
                      className="text-sm font-medium"
                    >
                      Bar/Restaurante (%)
                    </Label>
                    <Input
                      id="bar_discount_percent"
                      name="bar_discount_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formik.values.bar_discount_percent || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.bar_discount_percent &&
                      formik.errors.bar_discount_percent && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.bar_discount_percent}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label
                      htmlFor="merch_discount_percent"
                      className="text-sm font-medium"
                    >
                      Tienda/Mercancía (%)
                    </Label>
                    <Input
                      id="merch_discount_percent"
                      name="merch_discount_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formik.values.merch_discount_percent || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.merch_discount_percent &&
                      formik.errors.merch_discount_percent && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.merch_discount_percent}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label
                      htmlFor="event_discount_percent"
                      className="text-sm font-medium"
                    >
                      Eventos (%)
                    </Label>
                    <Input
                      id="event_discount_percent"
                      name="event_discount_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formik.values.event_discount_percent || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.event_discount_percent &&
                      formik.errors.event_discount_percent && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.event_discount_percent}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label
                      htmlFor="class_discount_percent"
                      className="text-sm font-medium"
                    >
                      Clases Privadas (%)
                    </Label>
                    <Input
                      id="class_discount_percent"
                      name="class_discount_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formik.values.class_discount_percent || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.class_discount_percent &&
                      formik.errors.class_discount_percent && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.class_discount_percent}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Extras */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Paso 4: Extras Personalizados
                    </p>
                    <p>
                      Agrega beneficios adicionales que manejas localmente en tu
                      club.
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Agregar Extra</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newExtra}
                      onChange={(e) => setNewExtra(e.target.value)}
                      placeholder="Ej: Acceso al gimnasio, Casillero incluido, Toalla gratis"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddExtra();
                        }
                      }}
                      className="h-11 px-4"
                    />
                    <Button
                      type="button"
                      onClick={handleAddExtra}
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formik.values.extras && formik.values.extras.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Extras Agregados ({formik.values.extras.length})
                    </Label>
                    {formik.values.extras.map((extra) => (
                      <div
                        key={extra.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 group hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            {extra.description}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExtra(extra.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <Gift className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      No hay extras agregados. Agrega beneficios adicionales
                      arriba.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Configuration */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Paso 5: Configuración Final
                    </p>
                    <p>
                      Ajusta la disponibilidad, orden de visualización y límites
                      de tu suscripción.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="max_subscribers"
                      className="text-sm font-medium"
                    >
                      Máximo de Suscriptores
                    </Label>
                    <Input
                      id="max_subscribers"
                      name="max_subscribers"
                      type="number"
                      min="0"
                      value={formik.values.max_subscribers || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Ilimitado"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.max_subscribers &&
                      formik.errors.max_subscribers && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.max_subscribers}
                        </p>
                      )}
                    <p className="text-xs text-gray-500 mt-1.5">
                      Deja vacío para ilimitado
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="display_order"
                      className="text-sm font-medium"
                    >
                      Orden de Visualización
                    </Label>
                    <Input
                      id="display_order"
                      name="display_order"
                      type="number"
                      min="0"
                      value={formik.values.display_order || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0"
                      className="mt-2 h-11 px-4"
                    />
                    {formik.touched.display_order &&
                      formik.errors.display_order && (
                        <p className="text-sm text-red-600 mt-1.5">
                          {formik.errors.display_order}
                        </p>
                      )}
                    <p className="text-xs text-gray-500 mt-1.5">
                      Menor número aparece primero
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label htmlFor="is_active" className="text-sm font-medium">
                      Estado de la Suscripción
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {formik.values.is_active
                        ? "Visible para usuarios"
                        : "Oculta para usuarios"}
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formik.values.is_active}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("is_active", checked)
                    }
                  />
                </div>

                {/* Summary Preview */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Resumen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-semibold">
                        {formik.values.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio:</span>
                      <span className="font-semibold">
                        ${formik.values.price_monthly} {formik.values.currency}
                        /mes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Beneficio en reservas:
                      </span>
                      <span className="font-semibold">
                        {formik.values.booking_discount_percent
                          ? `${formik.values.booking_discount_percent}% descuento`
                          : formik.values.booking_credits_monthly
                            ? `${formik.values.booking_credits_monthly} créditos`
                            : "Ninguno"}
                      </span>
                    </div>
                    {formik.values.extras &&
                      formik.values.extras.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extras:</span>
                          <span className="font-semibold">
                            {formik.values.extras.length}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Wizard Footer */}
        <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? handleClose : handleBack}
            disabled={formik.isSubmitting}
          >
            {currentStep === 0 ? "Cancelar" : "Atrás"}
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">Paso {currentStep + 1}</span>
            <span className="text-gray-400">de</span>
            <span className="font-semibold">{wizardSteps.length}</span>
          </div>

          {currentStep === wizardSteps.length - 1 ? (
            <Button
              onClick={() => formik.handleSubmit()}
              disabled={!canProceed() || formik.isSubmitting}
              className="min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {formik.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{editingSubscription ? "Actualizar" : "Crear"}</span>
                </div>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Siguiente
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
