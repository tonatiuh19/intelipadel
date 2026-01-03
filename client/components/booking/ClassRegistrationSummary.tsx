import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Target,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Instructor {
  id: number;
  name: string;
  specialties?: string[];
  bio?: string;
  image_url?: string;
}

interface ClassRegistrationSummaryProps {
  instructor: Instructor;
  clubName: string;
  clubImage: string;
  classType: "individual" | "group" | "semi_private";
  classDate: string;
  startTime: string;
  endTime: string;
  numberOfStudents: number;
  totalPrice: number;
  focusAreas?: string[];
  studentLevel?: "beginner" | "intermediate" | "advanced" | "expert" | null;
  feeStructure?: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
  serviceFeePercentage?: number;
}

export default function ClassRegistrationSummary({
  instructor,
  clubName,
  clubImage,
  classType,
  classDate,
  startTime,
  endTime,
  numberOfStudents,
  totalPrice,
  focusAreas,
  studentLevel,
  feeStructure = "club_absorbs_fee",
  serviceFeePercentage = 8,
}: ClassRegistrationSummaryProps) {
  // Calculate service fees based on fee structure
  const serviceFee = totalPrice * (serviceFeePercentage / 100);
  let userPaysServiceFee = 0;
  let basePrice = totalPrice;

  if (feeStructure === "user_pays_fee") {
    userPaysServiceFee = serviceFee;
  } else if (feeStructure === "shared_fee") {
    userPaysServiceFee = serviceFee / 2;
  }
  // club_absorbs_fee: userPaysServiceFee = 0

  const subtotal = basePrice + userPaysServiceFee;
  const iva = subtotal * 0.16;
  const totalWithIVA = subtotal + iva;

  const classTypeLabels: Record<string, string> = {
    individual: "Clase Individual",
    group: "Clase Grupal",
    semi_private: "Clase Semi-Privada",
  };

  const levelLabels: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto",
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-green-600" />
          Resumen de Clase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Club Image */}
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src={clubImage}
            alt={clubName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Class Type Badge */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            {classTypeLabels[classType] || classType}
          </span>
        </div>

        {/* Class Title */}
        <div className="text-center">
          <h3 className="font-bold text-xl text-green-900">
            Clase Privada de Pádel
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Con {instructor.name}
          </p>
        </div>

        {/* Instructor Info */}
        {instructor.image_url && (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={instructor.image_url}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                {instructor.name}
              </p>
              {instructor.specialties && instructor.specialties.length > 0 && (
                <p className="text-xs text-green-700">
                  {instructor.specialties.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Class Details */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Club</p>
              <p className="text-sm text-muted-foreground">{clubName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Fecha</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(classDate), "EEEE, d 'de' MMMM yyyy", {
                  locale: es,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Horario</p>
              <p className="text-sm text-muted-foreground">
                {startTime.substring(0, 5)} - {endTime.substring(0, 5)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Estudiantes</p>
              <p className="text-sm text-muted-foreground">
                {numberOfStudents}{" "}
                {numberOfStudents === 1 ? "estudiante" : "estudiantes"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Instructor</p>
              <p className="text-sm text-muted-foreground">{instructor.name}</p>
            </div>
          </div>

          {studentLevel && (
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nivel</p>
                <p className="text-sm text-muted-foreground">
                  {levelLabels[studentLevel] || studentLevel}
                </p>
              </div>
            </div>
          )}

          {focusAreas && focusAreas.length > 0 && (
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Áreas de Enfoque</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {focusAreas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-800"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tarifa de Clase</span>
            <span className="font-medium">${basePrice.toFixed(2)}</span>
          </div>

          {/* Service Fee (only if user pays) */}
          {userPaysServiceFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Cargo por Servicio ({serviceFeePercentage}%
                {feeStructure === "shared_fee" ? " ÷ 2" : ""})
              </span>
              <span className="font-medium">
                ${userPaysServiceFee.toFixed(2)}
              </span>
            </div>
          )}

          {feeStructure === "club_absorbs_fee" && (
            <div className="flex justify-between items-center text-xs text-muted-foreground italic">
              <span>Cargo por Servicio</span>
              <span>Incluido</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm pt-2 border-t">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">IVA (16%)</span>
            <span className="font-medium">${iva.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-bold">Total a Pagar</span>
            <span className="text-2xl font-bold text-green-600">
              ${totalWithIVA.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>Importante:</strong> Llega al menos 10 minutos antes de tu
            clase para prepararte y aprovechar al máximo el tiempo con tu
            instructor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
