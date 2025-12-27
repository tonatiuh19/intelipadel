import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClubs } from "@/store/slices/clubsSlice";

export default function Index() {
  const dispatch = useAppDispatch();
  const { clubs, loading } = useAppSelector((state) => state.clubs);

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div>
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold">
                  Reservas Inteligentes Simplificadas
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl font-black mb-6 leading-tight"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Reserva Tu Cancha de Padel Perfecta
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-white/90 mb-8 leading-relaxed"
                variants={itemVariants}
              >
                Descubre clubes de padel premium, verifica disponibilidad en
                tiempo real y reserva tu cancha en segundos. Rápido, simple y
                diseñado para todos los jugadores de padel.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 shadow-2xl shadow-primary/50"
                    asChild
                  >
                    <Link to="/booking">
                      Comenzar Reserva
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/20 border-white/40 hover:bg-white/30 text-white font-bold text-lg px-8 backdrop-blur-sm"
                    asChild
                  >
                    <a href="#clubs">Explorar Clubes</a>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-white/20"
                variants={itemVariants}
              >
                <motion.div whileHover={{ y: -5 }}>
                  <p className="text-3xl font-bold">1000+</p>
                  <p className="text-white/80 text-sm">Canchas Disponibles</p>
                </motion.div>
                <motion.div whileHover={{ y: -5 }}>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-white/80 text-sm">Jugadores Felices</p>
                </motion.div>
                <motion.div whileHover={{ y: -5 }}>
                  <p className="text-3xl font-bold">24h</p>
                  <p className="text-white/80 text-sm">
                    Reservas en Tiempo Real
                  </p>
                </motion.div>
              </motion.div>
            </div>

            <motion.div className="relative" variants={itemVariants}>
              <motion.div
                className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1517959872602-eaded9a78003?w=600&h=600&fit=crop"
                  alt="Padel Courts"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 via-transparent to-transparent"></div>
              </motion.div>

              {/* Floating Card */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 max-w-xs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-secondary">
                    Confirmación Instantánea
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reserva tu cancha y recibe confirmación instantánea en menos
                  de 30 segundos
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              ¿Por Qué Elegir Intelipadel?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para la experiencia de padel definitiva,
              optimizado para velocidad y simplicidad.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Asistente Inteligente de Reservas",
                description:
                  "Flujo de reserva guiado paso a paso en menos de 60 segundos. Selecciona club, elige tu hora y confirma.",
              },
              {
                icon: Calendar,
                title: "Disponibilidad en Tiempo Real",
                description:
                  "Ve la disponibilidad de canchas en vivo, calendario interactivo y horarios actualizados en tiempo real.",
              },
              {
                icon: MapPin,
                title: "Descubre Clubes",
                description:
                  "Explora clubes de padel premium con información detallada, amenidades, calificaciones y precios.",
              },
              {
                icon: Shield,
                title: "Seguro y Confiable",
                description:
                  "Evita dobles reservas con nuestro sistema avanzado. Tu cancha está garantizada.",
              },
              {
                icon: Users,
                title: "Características Comunitarias",
                description:
                  "Encuentra compañeros de juego, gestiona reservas grupales y únete a torneos.",
              },
              {
                icon: Trophy,
                title: "Recompensas por Lealtad",
                description:
                  "Gana puntos en cada reserva, desbloquea descuentos exclusivos y disfruta de beneficios VIP.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="p-8 border-2 hover:border-primary transition-all hover:shadow-xl h-full">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reserva tu cancha de padel en 3 pasos simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Elige Tu Club",
                description:
                  "Explora nuestro catálogo de clubes de padel premium y selecciona el que se ajuste a tus necesidades y ubicación.",
              },
              {
                step: "2",
                title: "Selecciona Fecha y Hora",
                description:
                  "Elige tu fecha y hora preferida de los horarios disponibles en tiempo real. Sin conflictos, sin sorpresas.",
              },
              {
                step: "3",
                title: "Confirma y Juega",
                description:
                  "Completa tu reserva y recibe confirmación instantánea. ¡Muestra tu correo de confirmación y disfruta!",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full font-bold text-2xl mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-8 -right-4 items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clubs Section */}
      <section id="clubs" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Clubes de Padel Destacados
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Clubes premium listos para recibirte. Disponibilidad en tiempo
              real, precios imbatibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubs.map((club) => (
              <Card
                key={club.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary cursor-pointer group"
                onClick={() => setBookingOpen(true)}
              >
                <div className="aspect-video bg-muted overflow-hidden relative">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm">{club.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-secondary mb-2 line-clamp-2">
                    {club.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{club.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-muted-foreground text-xs">Price</p>
                      <p className="font-bold text-primary">
                        ${club.pricePerHour}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-muted-foreground text-xs">Courts</p>
                      <p className="font-bold text-secondary">
                        {club.courtCount}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link to="/booking">
                      Reservar Ahora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Ver Todos los Clubes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Reservar Tu Cancha de Padel Perfecta?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Únete a miles de jugadores de padel que confían en Intelipadel para
            reservas rápidas y confiables. Tu próximo juego te espera.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8"
            asChild
          >
            <Link to="/booking">
              Reservar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    P
                  </span>
                </div>
                <span className="font-bold text-lg">Intelipadel</span>
              </div>
              <p className="text-white/80 text-sm">
                La forma inteligente de reservar canchas de padel. Rápido,
                simple, confiable.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Explorar Clubes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Cómo Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Precios
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contáctanos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Conviértete en Socio
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="/admin" className="hover:text-white transition">
                    Admin
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
            <p>
              &copy; 2024 Intelipadel. Todos los derechos reservados. Reserva
              inteligente, juega mejor.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
