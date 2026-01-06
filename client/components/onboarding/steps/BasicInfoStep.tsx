import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateBasicInfo, nextStep, previousStep } from "@/store/slices/clubOnboardingSlice";
import { Building2, Mail, Phone, Globe, MapPin, User } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("El nombre del club es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: Yup.string()
    .required("La descripción es obligatoria")
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  address: Yup.string()
    .required("La dirección es obligatoria")
    .min(5, "La dirección debe ser más específica"),
  city: Yup.string().required("La ciudad es obligatoria"),
  state: Yup.string().required("El estado es obligatorio"),
  postal_code: Yup.string()
    .required("El código postal es obligatorio")
    .matches(/^\d{5}$/, "Código postal inválido (5 dígitos)"),
  country: Yup.string().required("El país es obligatorio"),
  phone: Yup.string()
    .required("El teléfono del club es obligatorio")
    .matches(/^\d{10}$/, "Teléfono inválido (10 dígitos)"),
  email: Yup.string()
    .required("El email del club es obligatorio")
    .email("Email inválido"),
  admin_name: Yup.string()
    .required("Tu nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  admin_email: Yup.string()
    .required("Tu email es obligatorio")
    .email("Email inválido"),
  admin_phone: Yup.string()
    .required("Tu teléfono es obligatorio")
    .matches(/^\d{10}$/, "Teléfono inválido (10 dígitos)"),
});

export default function BasicInfoStep() {
  const dispatch = useAppDispatch();
  const { data: onboardingData, currentStep } = useAppSelector((state) => state.clubOnboarding);

  const handleSubmit = (values: any) => {
    dispatch(updateBasicInfo(values));
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Card className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Información Básica del Club</h2>
            <p>Proporciona los datos principales de tu club de pádel</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={{
          name: onboardingData.name || "",
          description: onboardingData.description || "",
          address: onboardingData.address || "",
          city: onboardingData.city || "",
          state: onboardingData.state || "",
          postal_code: onboardingData.postal_code || "",
          country: onboardingData.country || "México",
          phone: onboardingData.phone || "",
          email: onboardingData.email || "",
          admin_name: onboardingData.admin_name || "",
          admin_email: onboardingData.admin_email || "",
          admin_phone: onboardingData.admin_phone || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched, isValid, dirty }) => (
          <Form>
            <div className="space-y-4 sm:space-y-6">
              {/* Club Information Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Información del Club
                </h3>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">
                      Nombre del Club{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Ej: Club Elite Pádel"
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

                  <div className="md:col-span-2">
                    <Label htmlFor="description">
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Describe tu club, sus instalaciones y lo que lo hace especial..."
                      className={
                        errors.description && touched.description
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="description"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Ubicación
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">
                      Dirección Completa{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="address"
                      name="address"
                      placeholder="Calle, número, colonia"
                      className={
                        errors.address && touched.address
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="address"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">
                      Ciudad <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="city"
                      name="city"
                      placeholder="Ej: Lagos de Moreno"
                      className={
                        errors.city && touched.city ? "border-destructive" : ""
                      }
                    />
                    <ErrorMessage
                      name="city"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">
                      Estado <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="state"
                      name="state"
                      placeholder="Ej: Jalisco"
                      className={
                        errors.state && touched.state
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="state"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postal_code">
                      Código Postal <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="postal_code"
                      name="postal_code"
                      placeholder="47400"
                      maxLength={5}
                      className={
                        errors.postal_code && touched.postal_code
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="postal_code"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">
                      País <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="country"
                      name="country"
                      placeholder="México"
                      className={
                        errors.country && touched.country
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="country"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contacto del Club
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">
                      Teléfono <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        placeholder="4421234567"
                        maxLength={10}
                        className={
                          errors.phone && touched.phone
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </div>
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Email del Club <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contacto@tuclub.com"
                        className={
                          errors.email && touched.email
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Administrator Information Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Primer Super Administrador del Club
                </h3>
                <p className="text-sm mb-4">
                  Esta persona tendrá acceso completo al panel de administración
                  del club, podrá gestionar reservas, usuarios, instructores y
                  configuraciones. Es obligatorio designar al menos un super
                  administrador.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin_name">
                      Tu Nombre Completo{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="admin_name"
                      name="admin_name"
                      placeholder="Juan Pérez"
                      className={
                        errors.admin_name && touched.admin_name
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="admin_name"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin_email">
                      Tu Email <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="admin_email"
                      name="admin_email"
                      type="email"
                      placeholder="tu@email.com"
                      className={
                        errors.admin_email && touched.admin_email
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="admin_email"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin_phone">
                      Tu Teléfono <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="admin_phone"
                      name="admin_phone"
                      placeholder="4421234567"
                      maxLength={10}
                      className={
                        errors.admin_phone && touched.admin_phone
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="admin_phone"
                      component="p"
                      className="text-xs text-destructive mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                {currentStep > 1 && (
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
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isValid}
                  className="w-full sm:w-auto sm:min-w-[200px] sm:ml-auto"
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
