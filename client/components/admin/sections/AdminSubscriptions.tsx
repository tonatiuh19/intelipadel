import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/store/slices/adminSubscriptionsSlice";
import { ClubSubscription, CreateSubscriptionData } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Crown,
  Gift,
  Percent,
  CreditCard,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionWizard from "@/components/admin/SubscriptionWizard";
import SubscribersModal from "@/components/admin/SubscribersModal";

export default function AdminSubscriptions() {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.adminAuth);
  const { subscriptions, loading } = useAppSelector(
    (state) => state.adminSubscriptions,
  );
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<ClubSubscription | null>(null);
  const [subscribersModalOpen, setSubscribersModalOpen] = useState(false);
  const [
    selectedSubscriptionForSubscribers,
    setSelectedSubscriptionForSubscribers,
  ] = useState<ClubSubscription | null>(null);

  useEffect(() => {
    if (admin?.club_id) {
      dispatch(fetchSubscriptions(admin.club_id));
    }
  }, [dispatch, admin?.club_id]);

  const handleOpenWizard = (subscription?: ClubSubscription) => {
    setEditingSubscription(subscription || null);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingSubscription(null);
  };

  const handleOpenSubscribers = (subscription: ClubSubscription) => {
    setSelectedSubscriptionForSubscribers(subscription);
    setSubscribersModalOpen(true);
  };

  const handleCloseSubscribers = () => {
    setSubscribersModalOpen(false);
    setSelectedSubscriptionForSubscribers(null);
    // Refresh subscriptions to update counts
    if (admin?.club_id) {
      dispatch(fetchSubscriptions(admin.club_id));
    }
  };

  const handleWizardSubmit = async (data: CreateSubscriptionData) => {
    try {
      if (editingSubscription) {
        await dispatch(
          updateSubscription({ id: editingSubscription.id, ...data }),
        ).unwrap();
        toast({
          title: "Éxito",
          description: "Suscripción actualizada correctamente",
        });
      } else {
        await dispatch(createSubscription(data)).unwrap();
        toast({
          title: "Éxito",
          description: "Suscripción creada correctamente",
        });
      }

      handleCloseWizard();

      if (admin?.club_id) {
        dispatch(fetchSubscriptions(admin.club_id));
      }
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar la suscripción",
        variant: "destructive",
      });
      throw error; // Re-throw to let wizard handle it
    }
  };

  const handleDelete = async (id: number) => {
    const subscription = subscriptions.find((sub) => sub.id === id);

    if (subscription && subscription.current_subscribers > 0) {
      if (
        !confirm(
          `Esta suscripción tiene ${subscription.current_subscribers} suscriptor(es) activo(s). No se puede eliminar hasta que todos cancelen su suscripción.\n\n¿Deseas ver los suscriptores para cancelarlos primero?`,
        )
      ) {
        return;
      }
      // Open subscribers modal to allow admin to cancel subscriptions
      handleOpenSubscribers(subscription);
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar esta suscripción?")) {
      return;
    }

    try {
      await dispatch(deleteSubscription(id)).unwrap();
      toast({
        title: "Éxito",
        description: "Suscripción eliminada correctamente",
      });

      if (admin?.club_id) {
        dispatch(fetchSubscriptions(admin.club_id));
      }
    } catch (error: any) {
      console.error("Error deleting subscription:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "No se pudo eliminar la suscripción. Asegúrate de que no haya suscriptores activos.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `$${price}/${currency}/mes`;
  };

  const renderBenefit = (
    label: string,
    value: number | undefined,
    icon: React.ReactNode,
    suffix?: string,
  ) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>
          {label}:{" "}
          <strong>
            {value}
            {suffix || ""}
          </strong>
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Suscripciones</h1>
          <p className="mt-1">
            Gestiona los planes de suscripción mensual de tu club
          </p>
        </div>
        <Button onClick={() => handleOpenWizard()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Suscripción
        </Button>
      </div>

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay suscripciones
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primera suscripción para ofrecer beneficios a tus clientes
          </p>
          <Button onClick={() => handleOpenWizard()} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Suscripción
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <Card
              key={subscription.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                !subscription.is_active ? "opacity-60" : ""
              }`}
            >
              {!subscription.is_active && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary">Inactiva</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {subscription.name}
                    </CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      ${subscription.price_monthly}
                      <span className="text-sm text-gray-500 font-normal">
                        /{subscription.currency}/mes
                      </span>
                    </div>
                  </div>
                </div>
                {subscription.description && (
                  <p className="text-sm mt-2">{subscription.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="space-y-2">
                  {renderBenefit(
                    "Descuento en reservas",
                    subscription.booking_discount_percent,
                    <Percent className="h-4 w-4 text-primary" />,
                    "%",
                  )}
                  {renderBenefit(
                    "Créditos mensuales",
                    subscription.booking_credits_monthly,
                    <CreditCard className="h-4 w-4 text-blue-500" />,
                    " créditos",
                  )}
                  {renderBenefit(
                    "Descuento en bar",
                    subscription.bar_discount_percent,
                    <Percent className="h-4 w-4 text-green-500" />,
                    "%",
                  )}
                  {renderBenefit(
                    "Descuento en tienda",
                    subscription.merch_discount_percent,
                    <Gift className="h-4 w-4 text-purple-500" />,
                    "%",
                  )}
                  {renderBenefit(
                    "Descuento en eventos",
                    subscription.event_discount_percent,
                    <Percent className="h-4 w-4 text-pink-500" />,
                    "%",
                  )}
                  {renderBenefit(
                    "Descuento en clases",
                    subscription.class_discount_percent,
                    <Percent className="h-4 w-4 text-indigo-500" />,
                    "%",
                  )}
                </div>

                {/* Extras */}
                {subscription.extras && subscription.extras.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-semibold">Extras:</p>
                    {subscription.extras.map((extra) => (
                      <div
                        key={extra.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{extra.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenSubscribers(subscription)}
                    className="w-full justify-start text-sm text-muted-foreground hover:text-primary hover:bg-muted"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      Suscriptores:{" "}
                      <strong>{subscription.current_subscribers}</strong>
                      {subscription.max_subscribers &&
                        ` / ${subscription.max_subscribers}`}
                    </span>
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenWizard(subscription)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(subscription.id)}
                    disabled={subscription.current_subscribers > 0}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      subscription.current_subscribers > 0
                        ? `No se puede eliminar: ${subscription.current_subscribers} suscriptor(es) activo(s)`
                        : "Eliminar suscripción"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subscription Wizard */}
      <SubscriptionWizard
        open={isWizardOpen}
        onClose={handleCloseWizard}
        onSubmit={handleWizardSubmit}
        editingSubscription={editingSubscription}
        clubId={admin?.club_id || 0}
      />

      {/* Subscribers Modal */}
      {selectedSubscriptionForSubscribers && (
        <SubscribersModal
          open={subscribersModalOpen}
          onClose={handleCloseSubscribers}
          subscriptionId={selectedSubscriptionForSubscribers.id}
          subscriptionName={selectedSubscriptionForSubscribers.name}
          availableSubscriptions={subscriptions.map((sub) => ({
            id: sub.id,
            name: sub.name,
            price_monthly: sub.price_monthly,
            currency: sub.currency,
          }))}
        />
      )}
    </div>
  );
}
