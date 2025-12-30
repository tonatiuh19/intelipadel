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
}: ClassRegistrationSummaryProps) {
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
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-green-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-right mt-1">MXN</p>
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
