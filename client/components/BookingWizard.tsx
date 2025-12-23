import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { addDays, format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createBooking } from "@/store/slices/bookingsSlice";
import { fetchClubs, selectClub, clearSelectedClub } from "@/store/slices/clubsSlice";
import { Club } from "@shared/types";

type BookingStep = "club" | "datetime" | "confirm";

interface BookingWizardProps {
  onClose?: () => void;
  autoOpen?: boolean;
}

// Validation schema
const bookingValidationSchema = Yup.object({
  clubId: Yup.number().required("Por favor selecciona un club"),
  date: Yup.date().required("Por favor selecciona una fecha"),
  time: Yup.string().required("Por favor selecciona una hora"),
  duration: Yup.number().min(60, "Duración mínima 60 minutos").required("Duración requerida"),
});

export default function BookingWizard({ onClose, autoOpen = false }: BookingWizardProps) {
  const dispatch = useAppDispatch();
  const { clubs, selectedClub, loading: clubsLoading } = useAppSelector((state) => state.clubs);
  const { loading: bookingLoading } = useAppSelector((state) => state.bookings);
  
  const [step, setStep] = useState<BookingStep>("club");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      clubId: 0,
      clubName: "",
      date: null as Date | null,
      time: "",
      duration: 60,
    },
    validationSchema: bookingValidationSchema,
    onSubmit: async (values) => {
      if (values.date) {
        await dispatch(createBooking({
          clubId: values.clubId,
          clubName: values.clubName,
          date: format(values.date, "yyyy-MM-dd"),
          time: values.time,
          duration: values.duration,
        }));
        
        alert(
          `Booking confirmed at ${values.clubName} on ${format(values.date, "MMM dd, yyyy")} at ${values.time}`
        );
        
        // Reset form
        formik.resetForm();
        dispatch(clearSelectedClub());
        setStep("club");
        onClose?.();
      }
    },
  });

  const handleSelectClub = (club: Club) => {
    dispatch(selectClub(club));
    formik.setFieldValue("clubId", club.id);
    formik.setFieldValue("clubName", club.name);
    setStep("datetime");
  };

  const handleSelectDateTime = (date: Date, time: string) => {
    formik.setFieldValue("date", date);
    formik.setFieldValue("time", time);
    setStep("confirm");
  };

  const goBack = () => {
    if (step === "datetime") {
      setStep("club");
      formik.setFieldValue("date", null);
      formik.setFieldValue("time", "");
    } else if (step === "confirm") {
      setStep("datetime");
    }
  };

  const getStepNumber = () => {
    if (step === "club") return 1;
    if (step === "datetime") return 2;
    if (step === "confirm") return 3;
  };

  retu  {formik.errors.clubId && formik.touched.clubId && (
          <p className="text-red-500 text-sm mt-2">{formik.errors.clubId}</p>
        )}
        {formik.errors.date && formik.touched.date && (
          <p className="text-red-500 text-sm mt-2">{formik.errors.date}</p>
        )}
        {formik.errors.time && formik.touched.time && (
          <p className="text-red-500 text-sm mt-2">{formik.errors.time}</p>
        )}
      </div>

      {/* Step 1: Select Club */}
      {step === "club" && (
        <div className="space-y-4">
          {clubsLoading ? (
            <p className="text-center py-8">Cargando clubes...</p>
          ) : (
            <h2 className="text-2xl font-bold text-secondary">
            {step === "club" && "Selecciona Tu Club de Padel"}
            {step === "datetime" && "Elige Fecha y Hora"}
            {step === "confirm" && "Confirma Tu Reserva"}
          </h2>
          <span className="text-sm font-semibold text-primary">
            Paso {getStepNumber()} de 3
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: step === "club" ? "33%" : step === "datetime" ? "66%" : "100%",
            }}
          ></div>
        </div>
      </div>

      {/* Step 1: Select Club */}
      {step === "club" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <Card
                key={club.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => handleSelectClub(club)}
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={club.image}
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === "datetime" && selectedC
                  <h3 className="font-bold text-lg text-secondary mb-1">{club.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{club.location}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-sm ml-1">{club.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({club.reviews})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-bold text-primary">${club.pricePerHour}/hr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Courts</p>
                      <p className="font-bold">{club.courtCount}</p>
                    </div>
                  </div>
                  <Button variant="default" className="w-full" size="sm">
                    Seleccionar Club
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
formik.values.date &&
                  format(formik.values.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                return (
                  <button
                    key={dayOffset}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-muted hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="text-xs font-semibold">
                      {format(date, "EEE").toUpperCase()}
                    </div>
                    <div className="text-sm mt-1">{format(date, "dd")}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Selecciona Hora
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedClub.timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSelectDateTime(selectedDate, slot.time)}
                  disabled={slot.available === 0}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    slot.available === 0
                      ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      : formik.valuesibold text-secondary mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Selecciona Hora
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {bookingData.club.timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSelectDateTime(selectedDate, slot.time)}
                  disabled={slot.available === 0}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    slot.available === 0
                      ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      : bookingData.time === slot.time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted text-foreground hover:border-primary border-2 border-transparent"
                  }`}
                >
                  {slotformik.values.duration}
                onChange={(e) => formik.setFieldValue("duration", parseInt(e.target.value))}
                className="bg-background border border-border rounded-lg px-3 py-1 text-sm"
              >
                <option value={60}>1 Hora</option>
                <option value={90}>1.5 Horas</option>
                <option value={120}>2 Horas</option>
              </select>
            </div>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Precio Total</span>
              <span className="text-primary">
                ${(selectedClub.pricePerHour * (formik.values.duration / 60)).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
            <Button
              variant="default"
              onClick={() => setStep("confirm")}
              disabled={!formik.values.date || !formik.values.time}
              className="flex-1"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && selectedClub && formik.values.date && formik.values
              onClick={handleSelectDateTime}
              disabled={!bookingData.date || !bookingData.time}
              className="flex-1"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && bookingData.club && bookingData.date && bookingData.time && (
        <div className="space-y-6">
          <Card className="p-6 border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent">
            <h3 className="font-bold text-lg text-secondary mb-4">Resumen de Reserva</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Club</span>
                <div className="text-right">selectedClub.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClub.location}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-muted-foreground">Fecha y Hora</span>
                <div className="text-right">
                  <p className="font-semibold text-secondary">
                    {format(formik.values.date, "dd 'de' MMMM 'de' yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">{formik.values.time}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-muted-foreground">Duración</span>
                <p className="font-semibold text-secondary">{formik.values.duration} minutos</p>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center text-lg font-bold">
                <span>Precio Total</span>
                <span className="text-primary">
                  ${(selectedClub.pricePerHour * (formik.values.duration / 60)).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3 items-start">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">¡Cancha reservada para ti!</p>
                <p className="text-sm text-green-800 mt-1">
                  Recibirás un correo de confirmación con todos los detalles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
            <Button 
              variant="default" 
              onClick={() => formik.handleSubmit()} 
              disabled={bookingLoading}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              {bookingLoading ? "Procesando..." : "Confirmar Reserva"}"mr-2 h-4 w-4" />
              Confirmar Reserva
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
