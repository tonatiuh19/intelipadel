import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminEvents() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
        <p className="text-gray-600 mt-1">Administra eventos y torneos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Gestión de eventos próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
