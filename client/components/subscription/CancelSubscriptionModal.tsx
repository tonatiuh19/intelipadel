import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, X } from "lucide-react";

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  subscriptionName: string;
  loading?: boolean;
}

const CANCEL_PHRASE = "CANCELAR MI SUSCRIPCIÓN";

const validationSchema = Yup.object().shape({
  confirmPhrase: Yup.string()
    .required("Debes escribir la frase de confirmación")
    .test(
      "matches-phrase",
      `Debes escribir exactamente: ${CANCEL_PHRASE}`,
      (value) => value === CANCEL_PHRASE,
    ),
});

export default function CancelSubscriptionModal({
  open,
  onClose,
  onConfirm,
  subscriptionName,
  loading = false,
}: CancelSubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const formik = useFormik({
    initialValues: {
      confirmPhrase: "",
    },
    validationSchema,
    onSubmit: async () => {
      setIsProcessing(true);
      try {
        await onConfirm();
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error("Cancel error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const handleClose = () => {
    if (!isProcessing && !loading) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Cancelar Suscripción
        </DialogTitle>

        <div className="space-y-4 py-4">
          {/* Warning Message */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
            <p className="text-sm font-medium text-red-900">
              ⚠️ Estás a punto de cancelar tu suscripción:{" "}
              <strong>{subscriptionName}</strong>
            </p>
            <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
              <li>Perderás todos los beneficios de inmediato</li>
              <li>No se realizarán más cargos automáticos</li>
              <li>Tu método de pago será eliminado</li>
              <li>Esta acción no se puede deshacer</li>
            </ul>
          </div>

          {/* Confirmation Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmPhrase">
                Para continuar, escribe la siguiente frase:
              </Label>
              <div className="p-3 bg-gray-100 rounded-md mb-2 border-2 border-gray-300">
                <code className="text-sm font-mono font-bold text-gray-900">
                  {CANCEL_PHRASE}
                </code>
              </div>
              <Input
                id="confirmPhrase"
                name="confirmPhrase"
                placeholder="Escribe la frase aquí..."
                value={formik.values.confirmPhrase}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isProcessing || loading}
                className="font-mono"
              />
              {formik.touched.confirmPhrase && formik.errors.confirmPhrase && (
                <p className="text-sm text-red-500">
                  {formik.errors.confirmPhrase}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Nota: La frase distingue entre mayúsculas y minúsculas
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing || loading}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                No Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  isProcessing || loading || !formik.isValid || !formik.dirty
                }
                className="flex-1"
              >
                {isProcessing || loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Sí, Cancelar
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
