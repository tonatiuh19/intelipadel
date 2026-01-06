import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateCourts,
  addCourt,
  removeCourt,
  nextStep,
  previousStep,
  CourtOnboarding,
} from "@/store/slices/clubOnboardingSlice";
import {
  Map,
  Plus,
  Trash2,
  Check,
  Sun,
  Home,
  Layers,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const courtValidationSchema = Yup.object({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .max(50, "Máximo 50 caracteres"),
  court_type: Yup.string()
    .required("El tipo es obligatorio")
    .oneOf(["indoor", "outdoor", "covered"], "Tipo inválido"),
  surface_type: Yup.string()
    .required("La superficie es obligatoria")
    .oneOf(["glass", "concrete", "artificial_grass"], "Superficie inválida"),
  has_lighting: Yup.boolean().required(),
});

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

export default function CourtsStep() {
  const dispatch = useAppDispatch();
  const { courts = [], currentStep } = useAppSelector((state) => ({
    courts: state.clubOnboarding.data.courts,
    currentStep: state.clubOnboarding.currentStep,
  }));
  const [showAddForm, setShowAddForm] = useState(courts.length === 0);

  const handleAddCourt = (values: any, { resetForm }: any) => {
    const newCourt: CourtOnboarding = {
      ...values,
      display_order: courts.length + 1,
    };
    dispatch(addCourt(newCourt));
    resetForm();
  };

  const handleRemoveCourt = (index: number) => {
    dispatch(removeCourt(index));
  };

  const handleContinue = () => {
    if (courts.length > 0) {
      dispatch(nextStep());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Card className="p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Map className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Configuración de Canchas
            </h2>
            <p className="text-xs sm:text-sm">
              Agrega todas las canchas disponibles en tu club
            </p>
          </div>
        </div>
      </div>

      {/* Courts List */}
      {courts.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-lg font-semibold mb-3">
            Canchas Agregadas ({courts.length})
          </h3>
          <AnimatePresence>
            {courts.map((court, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-muted rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Map className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">
                        {court.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {court.court_type === "indoor" && (
                            <Home className="h-3 w-3" />
                          )}
                          {court.court_type === "outdoor" && (
                            <Sun className="h-3 w-3" />
                          )}
                          {court.court_type === "covered" && (
                            <Layers className="h-3 w-3" />
                          )}
                          {courtTypeLabels[court.court_type]}
                        </span>
                        <span>• {surfaceTypeLabels[court.surface_type]}</span>
                        {court.has_lighting && (
                          <span className="flex items-center gap-1">
                            • <Lightbulb className="h-3 w-3" /> Iluminación
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCourt(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Court Form */}
      {showAddForm ? (
        <Formik
          initialValues={{
            name: "",
            court_type: "outdoor",
            surface_type: "glass",
            has_lighting: true,
          }}
          validationSchema={courtValidationSchema}
          onSubmit={handleAddCourt}
        >
          {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
            <Form>
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nueva Cancha
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">
                      Nombre de la Cancha{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder='Ej: Cancha 1 "Principal"'
                      className={
                        errors.name && touched.name ? "border-destructive" : ""
                      }
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="court_type">
                      Tipo de Cancha <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={values.court_type}
                      onValueChange={(value) =>
                        setFieldValue("court_type", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.court_type && touched.court_type
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outdoor">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Exterior
                          </div>
                        </SelectItem>
                        <SelectItem value="indoor">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Interior
                          </div>
                        </SelectItem>
                        <SelectItem value="covered">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Techada
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="court_type"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="surface_type">
                      Tipo de Superficie{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={values.surface_type}
                      onValueChange={(value) =>
                        setFieldValue("surface_type", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.surface_type && touched.surface_type
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glass">Cristal</SelectItem>
                        <SelectItem value="concrete">Concreto</SelectItem>
                        <SelectItem value="artificial_grass">
                          Pasto Sintético
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="surface_type"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Field
                        type="checkbox"
                        name="has_lighting"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                      <span>Esta cancha tiene iluminación</span>
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    type="submit"
                    disabled={!isValid || !dirty}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Agregar Cancha
                  </Button>
                  {courts.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            </Form>
          )}
        </Formik>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Agregar Otra Cancha
        </Button>
      )}

      {/* Validation Message */}
      {courts.length === 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Importante:</strong> Debes agregar al menos una cancha para
            continuar.
          </p>
        </div>
      )}

      {/* Continue Button */}
      {courts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
          <Button
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
            onClick={handleContinue}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            Continuar
          </Button>
        </div>
      )}
    </Card>
  );
}
