import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface FeeStructureTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  isLoading?: boolean;
  feeStructure: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
  serviceFeePercentage: number;
}

const FEE_STRUCTURE_LABELS = {
  user_pays_fee: "Usuario Paga Comisión Completa",
  shared_fee: "Comisión Compartida 50/50",
  club_absorbs_fee: "Club Absorbe Comisión",
};

const FEE_STRUCTURE_DESCRIPTIONS = {
  user_pays_fee:
    "El usuario paga el monto completo de la reserva más la comisión de servicio. Por ejemplo, reserva de $750 + comisión 8% = $810 total. El club recibe $750.",
  shared_fee:
    "El usuario y el club comparten la comisión 50/50. Por ejemplo, reserva de $750 + comisión 4% = $780 total. El club recibe $720.",
  club_absorbs_fee:
    "El club absorbe la comisión dentro del precio mostrado. Por ejemplo, precio mostrado $750 (comisión incluida). El club recibe $690.",
};

export default function FeeStructureTermsDialog({
  open,
  onOpenChange,
  onAccept,
  isLoading = false,
  feeStructure,
  serviceFeePercentage,
}: FeeStructureTermsDialogProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      onAccept();
    }
  };

  const canAccept = termsAccepted && privacyAccepted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmación de Cambio de Estructura de Comisión
          </DialogTitle>
          <DialogDescription>
            Este es un cambio importante en la configuración de tu cuenta. Debes
            aceptar los términos y políticas actualizadas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Summary of change */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-orange-900">
                Nueva Estructura de Comisión
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">
                  {FEE_STRUCTURE_LABELS[feeStructure]}
                </p>
                <p>{FEE_STRUCTURE_DESCRIPTIONS[feeStructure]}</p>
                <p className="text-orange-700 font-medium mt-2">
                  Comisión de servicio: {serviceFeePercentage}%
                </p>
              </div>
            </div>

            {/* Terms explanation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Política de Comisión de Servicio
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Comisión No Reembolsable:</strong> La comisión de
                  servicio de InteliPadel es <strong>no reembolsable</strong> en
                  todos los casos, incluso si la reserva es cancelada o
                  reembolsada.
                </p>
                <p>
                  <strong>Transparencia:</strong> Los usuarios verán claramente
                  el desglose del precio, incluyendo el costo base de la reserva
                  y la comisión de servicio.
                </p>
                <p>
                  <strong>Impacto Financiero:</strong> Esta configuración afecta
                  directamente cómo se calculan los precios finales y los
                  depósitos que recibirás.
                </p>
                <p>
                  <strong>Responsabilidad:</strong> Al cambiar esta
                  configuración, confirmas que entiendes su impacto en tus
                  operaciones financieras y aceptas la estructura de comisiones
                  de InteliPadel.
                </p>
              </div>
            </div>

            {/* Acceptance checkboxes */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setTermsAccepted(checked as boolean)
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm cursor-pointer leading-tight"
                >
                  Acepto los{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Términos y Condiciones
                  </a>{" "}
                  de InteliPadel y entiendo que la comisión de servicio es no
                  reembolsable.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) =>
                    setPrivacyAccepted(checked as boolean)
                  }
                />
                <Label
                  htmlFor="privacy"
                  className="text-sm cursor-pointer leading-tight"
                >
                  Acepto la{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Política de Privacidad
                  </a>{" "}
                  de InteliPadel.
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!canAccept || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? "Guardando..." : "Aceptar y Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
