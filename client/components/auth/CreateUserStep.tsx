import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createUser, sendCode, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, User, Calendar } from "lucide-react";
import { useEffect } from "react";
import { PhoneInput } from "@/components/ui/phone-input";

const createUserSchema = Yup.object({
  first_name: Yup.string()
    .min(2, "Debe tener al menos 2 caracteres")
    .required("El nombre es requerido"),
  last_name: Yup.string()
    .min(2, "Debe tener al menos 2 caracteres")
    .required("El apellido es requerido"),
  phone: Yup.string()
    .test("phone-valid", "Formato de teléfono inválido", function (value) {
      if (!value) return false;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10;
    })
    .required("El teléfono es requerido"),
  date_of_birth: Yup.date()
    .max(new Date(), "La fecha no puede ser futura")
    .nullable(),
});

export default function CreateUserStep() {
  const dispatch = useAppDispatch();
  const { loading, error, tempEmail } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear error when component mounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (values: {
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth?: string;
  }) => {
    if (!tempEmail) return;

    dispatch(clearError());
    const result = await dispatch(
      createUser({
        email: tempEmail,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone.trim(),
        date_of_birth: values.date_of_birth || undefined,
      }),
    );

    // If user created successfully, send code
    if (createUser.fulfilled.match(result)) {
      const userId = result.payload.data.id;
      dispatch(sendCode({ user_id: userId, email: tempEmail }));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Correo:</strong> {tempEmail}
        </p>
      </div>

      <Formik
        initialValues={{
          first_name: "",
          last_name: "",
          phone: "",
          date_of_birth: "",
        }}
        validationSchema={createUserSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isValid, dirty, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  Nombre *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Field
                    as={Input}
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Juan"
                    className={`pl-10 h-12 text-base ${
                      errors.first_name && touched.first_name
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                {errors.first_name && touched.first_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Apellido *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Field
                    as={Input}
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Pérez"
                    className={`pl-10 h-12 text-base ${
                      errors.last_name && touched.last_name
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
                {errors.last_name && touched.last_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono *
              </Label>
              <PhoneInput
                id="phone"
                name="phone"
                value={values.phone}
                onChange={(value) => setFieldValue("phone", value)}
                onBlur={() => {}}
                disabled={loading}
                error={!!(errors.phone && touched.phone)}
              />
              {errors.phone && touched.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-sm font-medium">
                Fecha de nacimiento (opcional)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Field
                  as={Input}
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className={`pl-10 h-12 text-base ${
                    errors.date_of_birth && touched.date_of_birth
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.date_of_birth && touched.date_of_birth && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !isValid || !dirty}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
