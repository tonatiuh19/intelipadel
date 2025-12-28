import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAdminPlayers } from "@/store/slices/adminPlayersSlice";
import ManualBookingModal from "../ManualBookingModal";
import AddPlayerModal from "../AddPlayerModal";

export default function AdminPlayers() {
  const dispatch = useAppDispatch();
  const { players, isLoading } = useAppSelector((state) => state.adminPlayers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  useEffect(() => {
    dispatch(getAdminPlayers());
  }, [dispatch]);

  const filteredPlayers = players.filter((player) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      player.name.toLowerCase().includes(search) ||
      player.email.toLowerCase().includes(search) ||
      player.phone?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Jugadores
          </h1>
          <p className="text-gray-600 mt-1">
            Ve y administra los jugadores registrados
          </p>
        </div>
        <Button
          onClick={() => setShowAddPlayerModal(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Jugador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Jugadores ({filteredPlayers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar jugadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando jugadores...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron jugadores
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-600">{player.email}</p>
                      <p className="text-xs text-gray-500">{player.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Total de Reservaciones
                      </p>
                      <p className="font-bold text-lg">
                        {player.total_bookings}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Gastado</p>
                      <p className="font-bold text-lg text-green-600">
                        $
                        {player.total_spent
                          ? Number(player.total_spent).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Se Unió</p>
                      <p className="text-sm">
                        {new Date(player.created_at).toLocaleDateString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          player.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {player.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedPlayer({ id: player.id, name: player.name })
                      }
                      className="hover:bg-orange-50 hover:border-orange-500"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Crear Reserva
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Booking Modal */}
      {selectedPlayer && (
        <ManualBookingModal
          open={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          userId={selectedPlayer.id}
          userName={selectedPlayer.name}
          onSuccess={() => {
            dispatch(getAdminPlayers());
          }}
        />
      )}

      {/* Add Player Modal */}
      <AddPlayerModal
        open={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onSuccess={() => {
          setShowAddPlayerModal(false);
          dispatch(getAdminPlayers());
        }}
      />
    </div>
  );
}
