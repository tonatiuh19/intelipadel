import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getDashboardStats } from "@/store/slices/adminDashboardSlice";

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, recentBookings, isLoading, error } = useAppSelector(
    (state) => state.adminDashboard,
  );

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Panel Principal</h1>
        <p className="mt-1">
          ¡Bienvenido de nuevo! Aquí está una vista general de tu negocio.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium ">
              Total de Reservaciones
            </CardTitle>
            <Calendar className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalBookings || 0}
            </div>
            <p className="text-xs  mt-1">Reservaciones de todos los tiempos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium ">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(stats?.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs  mt-1">De reservaciones pagadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium ">
              Total de Jugadores
            </CardTitle>
            <Users className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlayers || 0}</div>
            <p className="text-xs  mt-1">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium ">
              Próximas Reservaciones
            </CardTitle>
            <TrendingUp className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.upcomingBookings || 0}
            </div>
            <p className="text-xs  mt-1">Reservaciones futuras</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Reservaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-card border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{booking.user_name}</p>
                    <p className="text-sm ">
                      {booking.club_name} - {booking.court_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.booking_date).toLocaleDateString()} at{" "}
                      {booking.start_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ${booking.total_price}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
