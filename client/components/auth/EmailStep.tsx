import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkUser, sendCode, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { useEffect } from "react";

const emailSchema = Yup.object({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("El correo electrónico es requerido"),
});

export default function EmailStep() {
  const dispatch = useAppDispatch();
  const { loading, error, tempUserId, tempEmail } = useAppSelector(
    (state) => state.auth,
  );

  // Auto-send code if user exists
  useEffect(() => {
    if (tempUserId && tempEmail) {
      dispatch(sendCode({ user_id: tempUserId, email: tempEmail }));
    }
  }, [tempUserId, tempEmail, dispatch]);

  useEffect(() => {
    // Clear error when component mounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (values: { email: string }) => {
    dispatch(clearError());
    await dispatch(checkUser(values.email.toLowerCase().trim()));
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Formik
        initialValues={{ email: "" }}
        validationSchema={emailSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isValid, dirty }) => (
          <Form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  className={`pl-10 h-12 text-base ${
                    errors.email && touched.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
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
                  Verificando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Al continuar, aceptas nuestros{" "}
          <a href="/terms" className="underline hover:text-primary">
            términos y condiciones
          </a>{" "}
          y{" "}
          <a href="/privacy" className="underline hover:text-primary">
            política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
