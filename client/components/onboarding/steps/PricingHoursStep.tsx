import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
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
  updatePricingAndHours,
  nextStep,
  previousStep,
  OperatingHours,
} from "@/store/slices/clubOnboardingSlice";
import { DollarSign, Clock, Calendar, Info } from "lucide-react";

const validationSchema = Yup.object({
  price_per_hour: Yup.number()
    .required("El precio por hora es obligatorio")
    .min(100, "El precio mínimo es $100 MXN")
    .max(10000, "El precio máximo es $10,000 MXN"),
  default_booking_duration: Yup.number()
    .required("La duración es obligatoria")
    .oneOf([60, 90, 120], "Duración inválida"),
  currency: Yup.string().required("La moneda es obligatoria"),
  operating_hours: Yup.array().of(
    Yup.object({
      day_of_week: Yup.string().required(),
      open_time: Yup.string().when("is_closed", {
        is: false,
        then: (schema) => schema.required("Hora de apertura obligatoria"),
        otherwise: (schema) => schema.optional(),
      }),
      close_time: Yup.string().when("is_closed", {
        is: false,
        then: (schema) => schema.required("Hora de cierre obligatoria"),
        otherwise: (schema) => schema.optional(),
      }),
      is_closed: Yup.boolean().required(),
    }),
  ),
});

const dayLabels: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function PricingHoursStep() {
  const dispatch = useAppDispatch();
  const onboardingData = useAppSelector((state) => state.clubOnboarding.data);

  const handleSubmit = (values: any) => {
    dispatch(updatePricingAndHours(values));
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Card className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-secondary">
              Precios y Horarios
            </h2>
            <p className="text-muted-foreground">
              Configura las tarifas y horarios de operación de tu club
            </p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={{
          price_per_hour: onboardingData.price_per_hour || 400,
          default_booking_duration:
            onboardingData.default_booking_duration || 90,
          currency: onboardingData.currency || "MXN",
          operating_hours: onboardingData.operating_hours || [
            {
              day_of_week: "monday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
            {
              day_of_week: "tuesday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
            {
              day_of_week: "wednesday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
            {
              day_of_week: "thursday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
            {
              day_of_week: "friday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
            {
              day_of_week: "saturday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
            {
              day_of_week: "sunday",
              open_time: "08:00",
              close_time: "22:00",
              is_closed: false,
            },
          ],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
      >
        {({ errors, touched, values, setFieldValue, isValid }) => (
          <Form>
            <div className="space-y-6">
              {/* Pricing Section */}
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Tarifas Base
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price_per_hour">
                      Precio por Hora{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Field
                        as={Input}
                        id="price_per_hour"
                        name="price_per_hour"
                        type="number"
                        className={`pl-7 ${
                          errors.price_per_hour && touched.price_per_hour
                            ? "border-destructive"
                            : ""
                        }`}
                      />
                    </div>
                    <ErrorMessage
                      name="price_per_hour"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Precio base por hora de reserva
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="default_booking_duration">
                      Duración Estándar{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={values.default_booking_duration.toString()}
                      onValueChange={(value) =>
                        setFieldValue(
                          "default_booking_duration",
                          parseInt(value),
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.default_booking_duration &&
                          touched.default_booking_duration
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 minutos (1 hora)</SelectItem>
                        <SelectItem value="90">
                          90 minutos (1.5 horas)
                        </SelectItem>
                        <SelectItem value="120">
                          120 minutos (2 horas)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="default_booking_duration"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Duración predeterminada de reservas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="currency">
                      Moneda <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={values.currency}
                      onValueChange={(value) =>
                        setFieldValue("currency", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.currency && touched.currency
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN (Peso Mexicano)</SelectItem>
                        <SelectItem value="USD">USD (Dólar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="currency"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      ℹ️ Acerca de las Tarifas
                    </p>
                    <p>
                      Este es tu precio base. Más adelante podrás configurar
                      precios premium para horarios específicos, descuentos por
                      duración, y promociones especiales desde el panel de
                      administración.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Hours Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Horarios de Operación
                </h3>

                <FieldArray name="operating_hours">
                  {() => (
                    <div className="space-y-3">
                      {values.operating_hours.map(
                        (day: OperatingHours, index: number) => (
                          <Card
                            key={day.day_of_week}
                            className="p-4 bg-muted/50"
                          >
                            <div className="grid md:grid-cols-4 gap-4 items-end">
                              <div>
                                <Label className="text-sm font-semibold">
                                  {dayLabels[day.day_of_week]}
                                </Label>
                              </div>

                              <div>
                                <Label
                                  htmlFor={`operating_hours.${index}.open_time`}
                                  className="text-xs"
                                >
                                  Apertura
                                </Label>
                                <Field
                                  as={Input}
                                  id={`operating_hours.${index}.open_time`}
                                  name={`operating_hours.${index}.open_time`}
                                  type="time"
                                  disabled={day.is_closed}
                                  className="text-sm"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor={`operating_hours.${index}.close_time`}
                                  className="text-xs"
                                >
                                  Cierre
                                </Label>
                                <Field
                                  as={Input}
                                  id={`operating_hours.${index}.close_time`}
                                  name={`operating_hours.${index}.close_time`}
                                  type="time"
                                  disabled={day.is_closed}
                                  className="text-sm"
                                />
                              </div>

                              <div>
                                <Label className="flex items-center gap-2 cursor-pointer text-sm">
                                  <Field
                                    type="checkbox"
                                    name={`operating_hours.${index}.is_closed`}
                                    className="h-4 w-4 rounded"
                                  />
                                  Cerrado
                                </Label>
                              </div>
                            </div>
                          </Card>
                        ),
                      )}
                    </div>
                  )}
                </FieldArray>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHours = values.operating_hours.map((day) => ({
                        ...day,
                        open_time: "08:00",
                        close_time: "22:00",
                        is_closed: false,
                      }));
                      setFieldValue("operating_hours", newHours);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    8:00 AM - 10:00 PM (Todos)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHours = values.operating_hours.map((day) => ({
                        ...day,
                        open_time: "06:00",
                        close_time: "23:00",
                        is_closed: false,
                      }));
                      setFieldValue("operating_hours", newHours);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    6:00 AM - 11:00 PM (Todos)
                  </Button>
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
                  Continuar
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
