import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserProfile } from "@/store/slices/authSlice";
import {
  fetchUserSubscription,
  fetchPaymentMethods,
  cancelSubscription,
  deletePaymentMethod,
} from "@/store/slices/userSubscriptionsSlice";
import { useToast } from "@/hooks/use-toast";
import {
  UserCircle,
  Mail,
  Phone,
  Calendar,
  Save,
  Crown,
  CreditCard,
  Gift,
  Percent,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";
import PaymentMethodsList from "@/components/subscription/PaymentMethodsList";
import CancelSubscriptionModal from "@/components/subscription/CancelSubscriptionModal";

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const {
    userSubscription,
    paymentMethods,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.userSubscriptions);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      dispatch(fetchUserSubscription(user.id));
      dispatch(fetchPaymentMethods(user.id));
    }
  }, [user, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    const result = await dispatch(
      updateUserProfile({
        userId: user.id,
        name: name.trim(),
        phone: phone.trim() || undefined,
      }),
    );

    if (result.meta.requestStatus === "fulfilled") {
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada exitosamente",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
    setIsEditing(false);
  };

  const handleCancelSubscription = async () => {
    if (!user || !userSubscription) return;

    try {
      await dispatch(
        cancelSubscription({
          userId: user.id,
          subscriptionId: userSubscription.subscription_id,
        }),
      ).unwrap();

      toast({
        title: "Suscripción Cancelada",
        description: "Tu suscripción ha sido cancelada exitosamente",
      });

      setShowCancelModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!user) return;

    try {
      await dispatch(deletePaymentMethod(paymentMethodId)).unwrap();

      toast({
        title: "Método Eliminado",
        description: "El método de pago ha sido eliminado",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo eliminar el método de pago",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Debes iniciar sesión para ver tu perfil
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Mi Perfil</h1>
          <p className="text-xl text-muted-foreground">
            Gestiona tu información, suscripción y métodos de pago
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            <TabsTrigger value="payment">Métodos de Pago</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {user.name}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || loading}
                    placeholder="Tu nombre completo"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="text-lg bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El correo no se puede modificar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing || loading}
                    placeholder="Tu número de teléfono"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Miembro desde
                  </Label>
                  <div className="text-lg text-muted-foreground">
                    {user.created_at &&
                      format(new Date(user.created_at), "dd 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  {!isEditing ? (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1"
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Mi Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Cargando...</p>
                  </div>
                ) : userSubscription && userSubscription.status === "active" ? (
                  <div className="space-y-6">
                    {/* Subscription Header */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div>
                        <SubscriptionBadge
                          subscriptionName={
                            userSubscription.subscription?.name || ""
                          }
                        />
                        <p className="text-2xl font-bold text-foreground mt-2">
                          ${userSubscription.subscription?.price_monthly}{" "}
                          {userSubscription.subscription?.currency}/mes
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {userSubscription.next_billing_date
                            ? `Se renueva el ${format(
                                new Date(userSubscription.next_billing_date),
                                "dd 'de' MMMM, yyyy",
                                {
                                  locale: es,
                                },
                              )}`
                            : "Renovación automática activa"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Activa
                      </Badge>
                    </div>

                    {/* Subscription Details */}
                    <div className="bg-muted/30 rounded-lg p-6 space-y-3">
                      <h3 className="font-semibold text-lg mb-4">
                        Detalles de la Suscripción
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Plan</p>
                          <p className="font-medium">
                            {userSubscription.subscription?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Club</p>
                          <p className="font-medium">
                            {userSubscription.subscription?.club_name ||
                              (userSubscription.subscription?.club_id
                                ? `Club #${userSubscription.subscription.club_id}`
                                : "-")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Fecha de inicio
                          </p>
                          <p className="font-medium">
                            {userSubscription.started_at
                              ? format(
                                  new Date(userSubscription.started_at),
                                  "dd/MM/yyyy",
                                  { locale: es },
                                )
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Estado
                          </p>
                          <p className="font-medium capitalize">
                            {userSubscription.status === "active"
                              ? "Activa"
                              : userSubscription.status === "past_due"
                                ? "Pago Pendiente"
                                : userSubscription.status === "cancelled"
                                  ? "Cancelada"
                                  : userSubscription.status === "paused"
                                    ? "Pausada"
                                    : userSubscription.status}
                          </p>
                        </div>
                        {userSubscription.subscription?.description && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">
                              Descripción
                            </p>
                            <p className="text-sm mt-1">
                              {userSubscription.subscription.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Benefits */}
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        Beneficios en Reservas
                      </h3>
                      <div className="space-y-3">
                        {userSubscription.subscription
                          ?.booking_discount_percent ? (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Percent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {
                                  userSubscription.subscription
                                    .booking_discount_percent
                                }
                                % de descuento
                              </p>
                              <p className="text-sm text-muted-foreground">
                                En todas tus reservas
                              </p>
                            </div>
                          </div>
                        ) : userSubscription.subscription
                            ?.booking_credits_monthly ? (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                              <Gift className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {(userSubscription.subscription
                                  .booking_credits_monthly || 0) -
                                  (userSubscription.bookings_used_this_month ||
                                    0)}{" "}
                                reservas disponibles
                              </p>
                              <p className="text-sm text-muted-foreground">
                                De{" "}
                                {
                                  userSubscription.subscription
                                    .booking_credits_monthly
                                }{" "}
                                mensuales (usadas:{" "}
                                {userSubscription.bookings_used_this_month || 0}
                                )
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Sin descuento en reservas
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Additional Discounts */}
                    {(userSubscription.subscription?.bar_discount_percent ||
                      userSubscription.subscription?.merch_discount_percent ||
                      userSubscription.subscription?.event_discount_percent ||
                      userSubscription.subscription
                        ?.class_discount_percent) && (
                      <div className="bg-muted/50 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">
                          Descuentos Adicionales
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {userSubscription.subscription
                            ?.bar_discount_percent && (
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">
                                  {
                                    userSubscription.subscription
                                      .bar_discount_percent
                                  }
                                  % en Bar
                                </p>
                              </div>
                            </div>
                          )}
                          {userSubscription.subscription
                            ?.merch_discount_percent && (
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">
                                  {
                                    userSubscription.subscription
                                      .merch_discount_percent
                                  }
                                  % en Tienda
                                </p>
                              </div>
                            </div>
                          )}
                          {userSubscription.subscription
                            ?.event_discount_percent && (
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">
                                  {
                                    userSubscription.subscription
                                      .event_discount_percent
                                  }
                                  % en Eventos
                                </p>
                              </div>
                            </div>
                          )}
                          {userSubscription.subscription
                            ?.class_discount_percent && (
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">
                                  {
                                    userSubscription.subscription
                                      .class_discount_percent
                                  }
                                  % en Clases
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    {userSubscription.subscription?.extras &&
                      Array.isArray(userSubscription.subscription.extras) &&
                      userSubscription.subscription.extras.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-6">
                          <h3 className="font-semibold text-lg mb-4">
                            Beneficios Extras
                          </h3>
                          <div className="space-y-2">
                            {userSubscription.subscription.extras.map(
                              (extra, index) => {
                                const description =
                                  typeof extra === "string"
                                    ? extra
                                    : "description" in extra
                                      ? extra.description
                                      : "";

                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3"
                                  >
                                    <Check className="h-5 w-5 text-green-600" />
                                    <p className="text-sm">{description}</p>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => {
                          window.location.href = "/booking";
                        }}
                        className="w-full"
                      >
                        Cambiar Plan de Suscripción
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Cancelar suscripción
                      </Button>
                    </div>

                    {/* Policies Section */}
                    {userSubscription.subscription?.club_id && (
                      <div className="bg-muted/30 rounded-lg p-6">
                        <h3 className="font-semibold text-base mb-3">
                          Políticas y Términos
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <a
                            href={`/clubs/${userSubscription.subscription.club_id}/terms`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Términos y Condiciones
                          </a>
                          <span className="text-muted-foreground">•</span>
                          <a
                            href={`/clubs/${userSubscription.subscription.club_id}/privacy`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Política de Privacidad
                          </a>
                          <span className="text-muted-foreground">•</span>
                          <a
                            href={`/clubs/${userSubscription.subscription.club_id}/cancellation`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Política de Cancelación
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      No tienes una suscripción activa
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Suscríbete para obtener descuentos exclusivos y beneficios
                    </p>
                    <Button asChild>
                      <a href="/booking">Ver Planes Disponibles</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Cargando...</p>
                  </div>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <PaymentMethodsList
                    paymentMethods={paymentMethods}
                    onDelete={handleDeletePaymentMethod}
                  />
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      No hay métodos de pago guardados
                    </h3>
                    <p className="text-muted-foreground">
                      Los métodos de pago se guardan cuando te suscribes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CancelSubscriptionModal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubscription}
          subscriptionName={userSubscription?.subscription?.name || ""}
        />
      </div>
    </div>
  );
}
