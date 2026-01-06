import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminPayments,
  fetchPaymentStats,
  refundPayment,
  syncWithStripe,
  setFilters,
  clearFilters,
  type Payment,
} from "@/store/slices/adminPaymentsSlice";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPayments() {
  const dispatch = useAppDispatch();
  const { payments, stats, loading, filters } = useAppSelector(
    (state) => state.adminPayments,
  );
  const { toast } = useToast();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [typeFilter, setTypeFilter] = useState(filters.type || "all");
  const [statusFilter, setStatusFilter] = useState(filters.status || "all");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");

  // Helper to safely convert amount to number
  const toNumber = (val: string | number): number => {
    return typeof val === "string" ? parseFloat(val) : val;
  };

  useEffect(() => {
    loadPayments();
    dispatch(fetchPaymentStats(0));
    // Sync pending payments with Stripe on mount
    syncPendingPayments();
  }, [dispatch]);

  const syncPendingPayments = async () => {
    try {
      // Get all pending payments and sync with Stripe
      const response = await fetch("/api/admin/payments/sync-pending", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminSessionToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Synced ${data.synced} pending payments with Stripe`);
        // Reload payments to show updated statuses
        if (data.synced > 0) {
          loadPayments();
          dispatch(fetchPaymentStats(0));
        }
      }
    } catch (error) {
      console.error("Error syncing pending payments:", error);
    }
  };

  const loadPayments = () => {
    const filterParams: any = {};
    if (typeFilter && typeFilter !== "all") filterParams.type = typeFilter;
    if (statusFilter && statusFilter !== "all")
      filterParams.status = statusFilter;
    if (startDate) filterParams.startDate = startDate;
    if (endDate) filterParams.endDate = endDate;
    if (searchTerm) filterParams.search = searchTerm;

    dispatch(setFilters(filterParams));
    dispatch(fetchAdminPayments(filterParams));
  };

  const handleApplyFilters = () => {
    loadPayments();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    dispatch(clearFilters());
    dispatch(fetchAdminPayments({}));
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    setRefunding(true);
    try {
      await dispatch(
        refundPayment({
          paymentId: selectedPayment.id,
          amount: refundAmount ? parseFloat(refundAmount) : undefined,
          reason: refundReason,
        }),
      ).unwrap();

      toast({
        title: "Reembolso Exitoso",
        description: "El pago ha sido reembolsado correctamente",
      });

      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundAmount("");
      setRefundReason("");
      loadPayments();
      dispatch(fetchPaymentStats(0));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo procesar el reembolso",
        variant: "destructive",
      });
    } finally {
      setRefunding(false);
    }
  };

  const handleSyncStripe = async (payment: Payment) => {
    setSyncing(true);
    try {
      await dispatch(syncWithStripe(payment.stripe_payment_intent_id)).unwrap();

      toast({
        title: "Sincronizado",
        description: "El pago ha sido sincronizado con Stripe",
      });

      loadPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "No se pudo sincronizar con Stripe",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> =
      {
        succeeded: {
          variant: "default",
          icon: CheckCircle,
          label: "Exitoso",
        },
        completed: {
          variant: "default",
          icon: CheckCircle,
          label: "Exitoso",
        },
        pending: {
          variant: "secondary",
          icon: Clock,
          label: "Pendiente",
        },
        failed: {
          variant: "destructive",
          icon: XCircle,
          label: "Fallido",
        },
        refunded: {
          variant: "outline",
          icon: RotateCcw,
          label: "Reembolsado",
        },
      };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      booking: { color: "bg-blue-100 text-blue-800", label: "Reserva" },
      event: { color: "bg-muted text-foreground", label: "Evento" },
      private_class: { color: "bg-green-100 text-green-800", label: "Clase" },
      class: { color: "bg-green-100 text-green-800", label: "Clase" },
      subscription: {
        color: "bg-muted text-foreground",
        label: "Suscripción",
      },
    };

    const config = variants[type] || {
      color: "bg-gray-100 text-gray-800",
      label: type || "N/A",
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const exportToCSV = () => {
    const headers = [
      "Fecha",
      "Tipo",
      "Usuario",
      "Email",
      "Descripción",
      "Monto",
      "Estado",
      "ID Stripe",
    ];

    const rows = payments.map((p) => [
      format(new Date(p.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
      p.payment_type,
      p.user_name,
      p.user_email,
      p.description,
      `$${toNumber(p.amount).toFixed(2)} ${p.currency}`,
      p.status,
      p.stripe_payment_intent_id,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `pagos_${format(new Date(), "yyyyMMdd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Pagos</h1>
          <p className="mt-1">Administra pagos y transacciones de Stripe</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(stats.total_revenue).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(stats.total_bookings) +
                  Number(stats.total_events) +
                  Number(stats.total_classes) +
                  Number(stats.total_subscriptions)}{" "}
                transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.total_bookings)}
              </div>
              <p className="text-xs text-muted-foreground">Pagos de reservas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos y Clases
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.total_events) + Number(stats.total_classes)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(stats.total_events)} eventos,{" "}
                {Number(stats.total_classes)} clases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reembolsado</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(stats.refunded_amount || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total reembolsado</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuario, email, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                />
              </div>
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="booking">Reservas</SelectItem>
                  <SelectItem value="event">Eventos</SelectItem>
                  <SelectItem value="private_class">Clases</SelectItem>
                  <SelectItem value="subscription">Suscripciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="succeeded">Exitoso</SelectItem>
                  {/*                   <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem> */}
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Aplicar
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Cargando pagos...
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No se encontraron pagos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments
                    .filter(
                      (payment) =>
                        payment.status === "succeeded" ||
                        payment.status === "completed" ||
                        payment.status === "refunded",
                    )
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(
                            new Date(payment.created_at),
                            "dd/MM/yyyy HH:mm",
                            { locale: es },
                          )}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(payment.payment_type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.user_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.user_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.description}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${toNumber(payment.amount).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.currency.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(payment.status === "succeeded" ||
                              payment.status === "completed") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setRefundAmount(
                                    toNumber(payment.amount).toString(),
                                  );
                                  setShowRefundModal(true);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reembolsar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncStripe(payment)}
                              disabled={syncing}
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                              />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reembolsar Pago</DialogTitle>
            <DialogDescription>
              Procesa un reembolso para este pago. El dinero será devuelto al
              cliente a través de Stripe.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Usuario:
                  </span>
                  <span className="font-medium">
                    {selectedPayment.user_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Monto original:
                  </span>
                  <span className="font-medium">
                    ${toNumber(selectedPayment.amount).toFixed(2)}{" "}
                    {selectedPayment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Descripción:
                  </span>
                  <span className="font-medium text-sm">
                    {selectedPayment.description}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="refundAmount">
                  Monto a Reembolsar (dejar vacío para reembolso total)
                </Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  placeholder={toNumber(selectedPayment.amount).toString()}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="refundReason">Motivo (opcional)</Label>
                <Textarea
                  id="refundReason"
                  placeholder="Describe el motivo del reembolso..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-muted/50 border border-border rounded-lg flex gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Esta acción procesará el reembolso inmediatamente en Stripe y
                  no se puede deshacer.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRefundModal(false);
                setSelectedPayment(null);
                setRefundAmount("");
                setRefundReason("");
              }}
              disabled={refunding}
            >
              Cancelar
            </Button>
            <Button onClick={handleRefund} disabled={refunding}>
              {refunding ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Reembolso"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
