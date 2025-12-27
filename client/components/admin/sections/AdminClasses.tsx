import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminClasses() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clases Privadas</h1>
        <p className="text-gray-600 mt-1">
          Administra clases privadas y entrenamientos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clases</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gestión de clases privadas próximamente...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
