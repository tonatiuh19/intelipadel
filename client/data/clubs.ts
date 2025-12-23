export interface TimeSlot {
  id: string;
  time: string;
  available: number;
}

export interface Club {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  courtCount: number;
  description: string;
  amenities: string[];
  available24h: boolean;
  timeSlots: TimeSlot[];
}

export const clubs: Club[] = [
  {
    id: "1",
    name: "Padel Prime Centro",
    location: "Av. Deportiva 123, Centro",
    image: "https://images.unsplash.com/photo-1554788365-6e1a4ec6a7d8?w=800&h=600&fit=crop",
    rating: 4.8,
    reviews: 234,
    pricePerHour: 45,
    courtCount: 8,
    description: "Canchas de padel premium en el corazón de la ciudad con iluminación profesional e instalaciones de clase mundial",
    amenities: ["Tienda Pro", "Café", "Regaderas", "Estacionamiento", "Lecciones Disponibles", "Aire Acondicionado"],
    available24h: false,
    timeSlots: [
      { id: "1", time: "06:00 AM", available: 3 },
      { id: "2", time: "07:00 AM", available: 2 },
      { id: "3", time: "08:00 AM", available: 0 },
      { id: "4", time: "09:00 AM", available: 4 },
      { id: "5", time: "10:00 AM", available: 5 },
      { id: "6", time: "11:00 AM", available: 2 },
      { id: "7", time: "12:00 PM", available: 1 },
      { id: "8", time: "01:00 PM", available: 3 },
      { id: "9", time: "02:00 PM", available: 4 },
      { id: "10", time: "03:00 PM", available: 5 },
      { id: "11", time: "04:00 PM", available: 2 },
      { id: "12", time: "05:00 PM", available: 0 },
      { id: "13", time: "06:00 PM", available: 1 },
      { id: "14", time: "07:00 PM", available: 3 },
      { id: "15", time: "08:00 PM", available: 4 },
    ],
  },
  {
    id: "2",
    name: "Padel Paraíso Complejo Deportivo",
    location: "Blvd. Atlético 456, Zona Norte",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    rating: 4.6,
    reviews: 189,
    pricePerHour: 40,
    courtCount: 12,
    description: "Gran complejo deportivo con múltiples canchas e instalaciones integrales para todos los niveles de habilidad",
    amenities: ["Restaurante", "Gimnasio", "Casilleros", "Estacionamiento Gratis", "Entrenamiento", "Organización de Torneos"],
    available24h: true,
    timeSlots: [
      { id: "1", time: "06:00 AM", available: 5 },
      { id: "2", time: "07:00 AM", available: 6 },
      { id: "3", time: "08:00 AM", available: 4 },
      { id: "4", time: "09:00 AM", available: 7 },
      { id: "5", time: "10:00 AM", available: 8 },
      { id: "6", time: "11:00 AM", available: 6 },
      { id: "7", time: "12:00 PM", available: 2 },
      { id: "8", time: "01:00 PM", available: 3 },
      { id: "9", time: "02:00 PM", available: 5 },
      { id: "10", time: "03:00 PM", available: 7 },
      { id: "11", time: "04:00 PM", available: 6 },
      { id: "12", time: "05:00 PM", available: 2 },
      { id: "13", time: "06:00 PM", available: 1 },
      { id: "14", time: "07:00 PM", available: 4 },
      { id: "15", time: "08:00 PM", available: 6 },
    ],
  },
  {
    id: "3",
    name: "Club Padel Élite",
    location: "Calle de Canchas 789, Zona Oeste",
    image: "https://images.unsplash.com/photo-1517959872602-eaded9a78003?w=800&h=600&fit=crop",
    rating: 4.9,
    reviews: 312,
    pricePerHour: 55,
    courtCount: 6,
    description: "Club de padel élite exclusivo con canchas premium, equipos de última tecnología y servicios VIP",
    amenities: ["Sala VIP", "Entrenamiento Privado", "Spa", "Restaurante", "Valet Parking", "Beneficios de Membresía"],
    available24h: false,
    timeSlots: [
      { id: "1", time: "07:00 AM", available: 2 },
      { id: "2", time: "08:00 AM", available: 1 },
      { id: "3", time: "09:00 AM", available: 2 },
      { id: "4", time: "10:00 AM", available: 3 },
      { id: "5", time: "11:00 AM", available: 2 },
      { id: "6", time: "12:00 PM", available: 1 },
      { id: "7", time: "01:00 PM", available: 2 },
      { id: "8", time: "02:00 PM", available: 2 },
      { id: "9", time: "03:00 PM", available: 3 },
      { id: "10", time: "04:00 PM", available: 2 },
      { id: "11", time: "05:00 PM", available: 1 },
      { id: "12", time: "06:00 PM", available: 0 },
      { id: "13", time: "07:00 PM", available: 2 },
      { id: "14", time: "08:00 PM", available: 2 },
    ],
  },
  {
    id: "4",
    name: "Padel Valle Deportes",
    location: "Av. Recreación 321, Valle Sur",
    image: "https://images.unsplash.com/photo-1518748849-c1a63f8fc4b9?w=800&h=600&fit=crop",
    rating: 4.5,
    reviews: 156,
    pricePerHour: 35,
    courtCount: 10,
    description: "Instalación de padel acogedora para familias con precios accesibles y programas para principiantes",
    amenities: ["Área Infantil", "Precios Accesibles", "Renta de Equipo", "Descuentos Grupales", "Lecciones", "Eventos Sociales"],
    available24h: false,
    timeSlots: [
      { id: "1", time: "08:00 AM", available: 4 },
      { id: "2", time: "09:00 AM", available: 5 },
      { id: "3", time: "10:00 AM", available: 6 },
      { id: "4", time: "11:00 AM", available: 4 },
      { id: "5", time: "12:00 PM", available: 3 },
      { id: "6", time: "01:00 PM", available: 5 },
      { id: "7", time: "02:00 PM", available: 6 },
      { id: "8", time: "03:00 PM", available: 5 },
      { id: "9", time: "04:00 PM", available: 4 },
      { id: "10", time: "05:00 PM", available: 3 },
      { id: "11", time: "06:00 PM", available: 4 },
      { id: "12", time: "07:00 PM", available: 5 },
    ],
  },
];
