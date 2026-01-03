import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectClub, sendCode } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ClubSelectionStep() {
  const dispatch = useAppDispatch();
  const { availableClubs, tempEmail, loading } = useAppSelector(
    (state) => state.auth,
  );
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const handleSelectClub = async (clubId: number, userId: number) => {
    setSelectedClubId(clubId);

    // Update state with selected club
    dispatch(selectClub({ clubId, userId }));

    // Send verification code
    if (tempEmail) {
      await dispatch(sendCode({ user_id: userId, email: tempEmail }));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center mb-6">
        Selecciona el club al que deseas acceder
      </p>

      <div className="space-y-3">
        {availableClubs.map((club) => (
          <Card
            key={`${club.id}-${club.user_id}`}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedClubId === club.id
                ? "border-primary ring-2 ring-primary/20"
                : ""
            }`}
            onClick={() => handleSelectClub(club.id, club.user_id)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {club.logo_url ? (
                  <img
                    src={club.logo_url}
                    alt={club.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-base">{club.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Click para acceder
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          Enviando código de verificación...
        </p>
      )}
    </div>
  );
}
