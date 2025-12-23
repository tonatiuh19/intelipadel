import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyCode, sendCode, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ShieldCheck, RefreshCw } from "lucide-react";

const codeSchema = Yup.object({
  code: Yup.string()
    .matches(/^\d{6}$/, "El código debe tener 6 dígitos")
    .required("El código es requerido"),
});

export default function CodeVerificationStep() {
  const dispatch = useAppDispatch();
  const { loading, error, tempUserId, tempEmail } = useAppSelector(
    (state) => state.auth,
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Clear error when component mounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (values: { code: string }) => {
    if (!tempUserId) return;

    dispatch(clearError());
    await dispatch(
      verifyCode({
        user_id: tempUserId,
        code: values.code.trim(),
      }),
    );
  };

  const handleResendCode = async () => {
    if (!tempUserId || !tempEmail || resendCooldown > 0) return;

    setResendLoading(true);
    dispatch(clearError());

    try {
      await dispatch(sendCode({ user_id: tempUserId, email: tempEmail }));
      setResendCooldown(60); // 60 seconds cooldown
    } finally {
      setResendLoading(false);
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

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm text-muted-foreground">
          Hemos enviado un código de verificación a:
        </p>
        <p className="text-sm font-semibold">{tempEmail}</p>
      </div>

      <Formik
        initialValues={{ code: "" }}
        validationSchema={codeSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isValid, dirty, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Field
                    as={Input}
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    className={`pl-10 h-14 text-center text-2xl tracking-widest font-mono ${
                      errors.code && touched.code
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={loading}
                    autoFocus
                    autoComplete="one-time-code"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, "");
                      setFieldValue("code", value);
                    }}
                  />
                </div>
              </div>
              {errors.code && touched.code && (
                <p className="text-sm text-red-500 text-center mt-1">
                  {errors.code}
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
                  Verificando...
                </>
              ) : (
                "Verificar código"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="text-sm"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : resendCooldown > 0 ? (
                  `Reenviar código en ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar código
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="text-center text-sm text-muted-foreground">
        <p>El código expira en 10 minutos</p>
      </div>
    </div>
  );
}
