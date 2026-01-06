import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ArrowUp,
  XCircle,
  Loader2,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Subscriber {
  user_subscription_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone?: string;
  status: "active" | "past_due" | "cancelled" | "paused";
  started_at: string;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  bookings_used_this_month?: number;
  subscription_name: string;
  price_monthly: number;
  currency: string;
}

interface SubscribersModalProps {
  open: boolean;
  onClose: () => void;
  subscriptionId: number;
  subscriptionName: string;
  availableSubscriptions: Array<{
    id: number;
    name: string;
    price_monthly: number;
    currency: string;
  }>;
}

export default function SubscribersModal({
  open,
  onClose,
  subscriptionId,
  subscriptionName,
  availableSubscriptions,
}: SubscribersModalProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] =
    useState<Subscriber | null>(null);
  const [newSubscriptionId, setNewSubscriptionId] = useState<string>("");
  const [cancelReason, setCancelReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open && subscriptionId) {
      fetchSubscribers();
    }
  }, [open, subscriptionId]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/subscribers`,
        {
          headers: {
            Authorization: `Bearer ${adminSessionToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const data = await response.json();
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los suscriptores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriber: Subscriber) => {
    if (
      !confirm(
        `¿Estás seguro de cancelar la suscripción de ${subscriber.user_name}?`,
      )
    ) {
      return;
    }

    setActionLoading(subscriber.user_subscription_id);
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch(
        `/api/admin/subscriptions/${subscriber.user_subscription_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminSessionToken}`,
          },
          body: JSON.stringify({
            reason: cancelReason || "Cancelled by admin",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast({
        title: "Éxito",
        description: "Suscripción cancelada correctamente",
      });

      fetchSubscribers();
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenUpgrade = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setNewSubscriptionId("");
    setUpgradeModalOpen(true);
  };

  const handleUpgradeSubscription = async () => {
    if (!selectedSubscriber || !newSubscriptionId) return;

    setActionLoading(selectedSubscriber.user_subscription_id);
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch(
        `/api/admin/subscriptions/${selectedSubscriber.user_subscription_id}/upgrade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminSessionToken}`,
          },
          body: JSON.stringify({
            new_subscription_id: parseInt(newSubscriptionId),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upgrade subscription");
      }

      toast({
        title: "Éxito",
        description: "Suscripción actualizada correctamente",
      });

      setUpgradeModalOpen(false);
      setSelectedSubscriber(null);
      fetchSubscribers();
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la suscripción",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      active: { label: "Activa", variant: "default" },
      past_due: { label: "Vencida", variant: "destructive" },
      cancelled: { label: "Cancelada", variant: "secondary" },
      paused: { label: "Pausada", variant: "outline" },
    };

    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-6 w-6 text-primary" />
              Suscriptores - {subscriptionName}
            </DialogTitle>
            <DialogDescription>
              Gestiona los usuarios suscritos a este plan
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay suscriptores en este plan todavía
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.user_subscription_id}
                  className="border rounded-lg p-4 hover:border-primary transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg">
                          {subscriber.user_name}
                        </h4>
                        {getStatusBadge(subscriber.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{subscriber.user_email}</span>
                        </div>
                        {subscriber.user_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{subscriber.user_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Inicio:{" "}
                            {format(
                              new Date(subscriber.started_at),
                              "dd MMM yyyy",
                              { locale: es },
                            )}
                          </span>
                        </div>
                        {subscriber.current_period_end && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Próximo cobro:{" "}
                              {format(
                                new Date(subscriber.current_period_end),
                                "dd MMM yyyy",
                                { locale: es },
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {subscriber.status === "active" && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenUpgrade(subscriber)}
                        disabled={
                          actionLoading === subscriber.user_subscription_id
                        }
                        className="flex-1"
                      >
                        {actionLoading === subscriber.user_subscription_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Cambiar Plan
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSubscription(subscriber)}
                        disabled={
                          actionLoading === subscriber.user_subscription_id
                        }
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {actionLoading === subscriber.user_subscription_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {subscriber.cancelled_at && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                      Cancelada el{" "}
                      {format(
                        new Date(subscriber.cancelled_at),
                        "dd MMM yyyy",
                        {
                          locale: es,
                        },
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo plan para {selectedSubscriber?.user_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Plan Actual</Label>
              <div className="p-3 bg-gray-50 rounded-md mt-1">
                <p className="font-semibold">{subscriptionName}</p>
                <p className="text-sm text-gray-600">
                  ${selectedSubscriber?.price_monthly}/
                  {selectedSubscriber?.currency}/mes
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="newPlan">Nuevo Plan</Label>
              <Select
                value={newSubscriptionId}
                onValueChange={setNewSubscriptionId}
              >
                <SelectTrigger id="newPlan" className="mt-1">
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubscriptions
                    .filter((sub) => sub.id !== subscriptionId)
                    .map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name} - ${sub.price_monthly}/{sub.currency}/mes
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setUpgradeModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpgradeSubscription}
                disabled={!newSubscriptionId || actionLoading !== null}
                className="flex-1"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cambiar Plan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
