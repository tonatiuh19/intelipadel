import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendAdminVerificationCode,
  verifyAdminCode,
  validateAdminSession,
  clearAdminError,
} from "@/store/slices/adminAuthSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, Shield } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function Admin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { admin, isAuthenticated, isLoading, error, verificationEmail } =
    useAppSelector((state) => state.adminAuth);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");

  // Validate session on mount
  useEffect(() => {
    console.log("🔄 Admin page mounted, checking session...");
    dispatch(validateAdminSession());
  }, [dispatch]);

  // Handle successful authentication
  useEffect(() => {
    console.log("🔍 Admin state changed:", {
      verificationEmail,
      isAuthenticated,
      step,
    });
    if (verificationEmail && !isAuthenticated) {
      console.log("✅ Changing step to 'code'");
      setStep("code");
    }
  }, [verificationEmail, isAuthenticated]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    console.log("📤 Sending verification code to:", email);

    try {
      const result = await dispatch(sendAdminVerificationCode(email)).unwrap();
      console.log("✅ Code sent successfully:", result);
      // Directly change step after successful send
      setStep("code");
    } catch (err) {
      console.error("❌ Failed to send code:", err);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !verificationEmail) return;

    try {
      await dispatch(
        verifyAdminCode({ email: verificationEmail, code }),
      ).unwrap();
    } catch (err) {
      console.error("Failed to verify code:", err);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    dispatch(clearAdminError());
  };

  // If authenticated, show admin panel
  if (isAuthenticated && admin) {
    return <AdminLayout />;
  }

  // Show loading while validating session
  if (isLoading && !verificationEmail) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Otherwise show login screen
  return (
    <div className="flex h-screen w-full">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-center items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] via-blue-700 to-orange-600 animate-gradient-shift" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto text-center space-y-8">
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="relative">
                <Shield className="h-16 w-16 text-white animate-pulse-slow" />
                <div className="absolute inset-0 h-16 w-16 bg-white/20 rounded-lg blur-xl animate-pulse-slow" />
              </div>
              <h1 className="text-5xl font-bold text-white animate-shimmer bg-gradient-to-r from-white via-orange-100 to-white bg-[length:200%_100%]">
                InteliPadel
              </h1>
            </div>
            <h2 className="text-4xl font-semibold text-white mb-6 animate-fade-in-up animation-delay-200">
              Panel de Control Administrativo
            </h2>
            <p className="text-orange-50 text-lg leading-relaxed animate-fade-in-up animation-delay-400">
              Administra tus clubes de pádel, reservaciones, canchas y jugadores
              desde un panel centralizado. Accede a herramientas poderosas para
              hacer crecer tu negocio.
            </p>
          </div>

          <div className="space-y-4 relative z-10 mt-12">
            <div className="group flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer animate-fade-in-up animation-delay-600">
              <div className="bg-white/30 rounded-lg p-2 group-hover:bg-white/40 transition-colors duration-300 group-hover:scale-110 transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold mb-1">Acceso Seguro</h3>
                <p className="text-orange-50 text-sm">
                  Autenticación de dos factores con códigos de verificación por
                  email
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer animate-fade-in-up animation-delay-800">
              <div className="bg-white/30 rounded-lg p-2 group-hover:bg-white/40 transition-colors duration-300 group-hover:scale-110 transform">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold mb-1">
                  Acceso por Roles
                </h3>
                <p className="text-orange-50 text-sm">
                  Súper administradores y administradores específicos de club
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float animation-delay-2000" />

        <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8 animate-fade-in-down">
            <div className="relative">
              <Shield className="h-10 w-10 text-[hsl(var(--primary))] animate-pulse-slow" />
              <div className="absolute inset-0 bg-orange-400 rounded-lg blur-lg opacity-20 animate-pulse-slow" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-orange-600 bg-clip-text text-transparent">
              InteliPadel Admin
            </h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === "email"
                ? "Bienvenido de nuevo"
                : "Ingresa el código de verificación"}
            </h2>
            <p className="text-gray-600">
              {step === "email"
                ? "Inicia sesión en tu cuenta de administrador para continuar"
                : `Hemos enviado un código de 6 dígitos a ${verificationEmail}`}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <form
              onSubmit={handleSendCode}
              className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200/50 hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="space-y-2 animate-fade-in-up animation-delay-200">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email de Administrador
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@intelipadel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all duration-200 hover:border-orange-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-orange-600 hover:from-orange-700 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl animate-fade-in-up animation-delay-400 relative overflow-hidden group"
                size="lg"
                disabled={isLoading || !email}
              >
                <span className="relative z-10">
                  {isLoading ? "Enviando..." : "Enviar Código de Verificación"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyCode}
              className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200/50 hover:shadow-orange-500/10 transition-all duration-300 animate-scale-in"
            >
              <div className="space-y-2 animate-fade-in-up animation-delay-200">
                <Label htmlFor="code" className="text-gray-700 font-medium">
                  Código de Verificación
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  className="text-center text-2xl tracking-widest border-gray-300 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all duration-200"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-orange-600 hover:from-orange-700 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden group"
                size="lg"
                disabled={isLoading || code.length !== 6}
              >
                <span className="relative z-10">
                  {isLoading ? "Verificando..." : "Verificar e Iniciar Sesión"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBackToEmail}
                disabled={isLoading}
              >
                Usar un email diferente
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>
              Por razones de seguridad, las cuentas de administrador no pueden
              crearse desde esta interfaz. Contacta a un súper administrador
              para obtener acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
