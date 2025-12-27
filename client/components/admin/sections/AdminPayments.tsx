import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPayments() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600 mt-1">Administra pagos y transacciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Gestión de pagos próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
