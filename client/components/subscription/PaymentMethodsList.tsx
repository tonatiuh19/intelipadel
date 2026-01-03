import { CreditCard, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default?: boolean;
}

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  onDelete: (paymentMethodId: string) => void;
  onSetDefault?: (paymentMethodId: string) => void;
  loading?: boolean;
  deletingId?: string | null;
}

const brandColors: Record<string, string> = {
  visa: "bg-blue-600",
  mastercard: "bg-red-600",
  amex: "bg-green-600",
  discover: "bg-orange-600",
  default: "bg-gray-600",
};

export default function PaymentMethodsList({
  paymentMethods,
  onDelete,
  onSetDefault,
  loading = false,
  deletingId = null,
}: PaymentMethodsListProps) {
  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No tienes métodos de pago guardados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {paymentMethods.map((pm) => (
        <Card key={pm.id} className="relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Card Icon */}
                <div
                  className={`h-12 w-16 rounded flex items-center justify-center ${
                    brandColors[pm.brand.toLowerCase()] || brandColors.default
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-white" />
                </div>

                {/* Card Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{pm.brand}</span>
                    <span className="text-muted-foreground">
                      •••• {pm.last4}
                    </span>
                    {!!pm.is_default && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-green-100 text-green-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Predeterminada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Vence {pm.exp_month.toString().padStart(2, "0")}/
                    {pm.exp_year}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onSetDefault && !pm.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(pm.id)}
                    disabled={loading}
                  >
                    Predeterminar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(pm.id)}
                  disabled={loading || deletingId === pm.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === pm.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
