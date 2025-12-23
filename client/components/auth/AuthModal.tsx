import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetAuthFlow } from "@/store/slices/authSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmailStep from "./EmailStep";
import CreateUserStep from "./CreateUserStep";
import CodeVerificationStep from "./CodeVerificationStep";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const { authStep, isAuthenticated } = useAppSelector((state) => state.auth);

  // Close modal when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onOpenChange(false);
    }
  }, [isAuthenticated, onOpenChange]);

  // Reset flow when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      dispatch(resetAuthFlow());
    }
    onOpenChange(newOpen);
  };

  // Determine title and description based on step
  const getStepContent = () => {
    switch (authStep) {
      case "email":
        return {
          title: "¡Bienvenido! 👋",
          description: "Ingresa tu correo electrónico para comenzar",
        };
      case "create-user":
        return {
          title: "Completa tu perfil 🎾",
          description: "Solo necesitamos algunos datos más",
        };
      case "verify-code":
        return {
          title: "Verifica tu código 🔐",
          description: "Hemos enviado un código a tu correo",
        };
      default:
        return {
          title: "Autenticación",
          description: "Inicia sesión o regístrate",
        };
    }
  };

  const { title, description } = getStepContent();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {authStep === "email" && <EmailStep />}
          {authStep === "create-user" && <CreateUserStep />}
          {authStep === "verify-code" && <CodeVerificationStep />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
