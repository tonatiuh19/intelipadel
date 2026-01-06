import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  Shield,
  Star,
  ArrowRight,
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle2,
  Smartphone,
  Zap,
  FileText,
  Crown,
  Sparkles,
  Lock,
  TrendingUp,
  Settings,
  Mail,
  Bell,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function ForClubs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const features = [
    {
      category: "Gestión de Reservas",
      icon: Calendar,
      items: [
        {
          title: "Calendario Visual Unificado",
          description:
            "Ve todas las reservas, clases y eventos en una vista de calendario interactiva",
          icon: Calendar,
        },
        {
          title: "Reservas Manuales",
          description:
            "Crea reservas directamente desde el panel para clientes que llaman o visitan en persona",
          icon: Clock,
        },
        {
          title: "Disponibilidad en Tiempo Real",
          description:
            "Sistema que previene dobles reservas y actualiza la disponibilidad instantáneamente",
          icon: Zap,
        },
        {
          title: "Bloqueo de Fechas",
          description:
            "Bloquea canchas específicas o días completos para mantenimiento, eventos especiales o días festivos",
          icon: Lock,
        },
      ],
    },
    {
      category: "Gestión de Clientes",
      icon: Users,
      items: [
        {
          title: "Base de Datos Completa",
          description:
            "Perfil completo de cada jugador con historial de reservas, gastos totales y preferencias",
          icon: Users,
        },
        {
          title: "Análisis de Comportamiento",
          description:
            "Métricas de frecuencia, horarios favoritos y valor de vida del cliente",
          icon: BarChart3,
        },
        {
          title: "Comunicación Directa",
          description:
            "Sistema de notificaciones por email para confirmaciones, recordatorios y promociones",
          icon: Mail,
        },
        {
          title: "Programas de Lealtad",
          description:
            "Gestiona suscripciones premium y recompensas para jugadores frecuentes",
          icon: Crown,
        },
      ],
    },
    {
      category: "Eventos & Torneos",
      icon: Trophy,
      items: [
        {
          title: "Gestión de Torneos",
          description:
            "Crea y administra torneos, ligas y eventos con inscripción y pagos integrados",
          icon: Trophy,
        },
        {
          title: "Programación de Canchas",
          description:
            "Asigna múltiples canchas a eventos con horarios específicos para cada una",
          icon: Settings,
        },
        {
          title: "Control de Participantes",
          description:
            "Gestiona inscripciones, pagos, equipos y límites de participantes",
          icon: CheckCircle2,
        },
        {
          title: "Eventos Sociales",
          description:
            "Organiza clínicas, eventos sociales y campeonatos con facilidad",
          icon: Sparkles,
        },
      ],
    },
    {
      category: "Pagos & Finanzas",
      icon: CreditCard,
      items: [
        {
          title: "Pagos Integrados",
          description:
            "Integración completa con Stripe para pagos seguros con tarjeta",
          icon: CreditCard,
        },
        {
          title: "Reportes Financieros",
          description:
            "Dashboard con ingresos totales, reservas pagadas y métricas de crecimiento",
          icon: TrendingUp,
        },
        {
          title: "Facturación Automática",
          description:
            "Sistema de facturación con seguimiento de solicitudes y envíos de facturas",
          icon: FileText,
        },
        {
          title: "Gestión de Suscripciones",
          description:
            "Crea planes de membresía mensuales con beneficios personalizados y descuentos",
          icon: Star,
        },
      ],
    },
    {
      category: "Gestión de Clases",
      icon: GraduationCap,
      items: [
        {
          title: "Gestión de Instructores",
          description:
            "Administra tu equipo de instructores con perfiles completos, especialidades, tarifas y calificaciones",
          icon: Users,
        },
        {
          title: "Disponibilidad de Instructores",
          description:
            "Configura horarios disponibles por día de la semana y bloquea fechas específicas para vacaciones o eventos",
          icon: Calendar,
        },
        {
          title: "Clases Privadas",
          description:
            "Reserva y gestiona clases individuales o grupales con seguimiento completo de pagos y asistencia",
          icon: GraduationCap,
        },
        {
          title: "Calendario de Clases",
          description:
            "Visualiza todas las clases programadas en un calendario unificado con reservas de canchas",
          icon: Clock,
        },
      ],
    },
    {
      category: "Control & Seguridad",
      icon: Shield,
      items: [
        {
          title: "Múltiples Usuarios Admin",
          description:
            "Agrega administradores de club con permisos específicos para tu equipo",
          icon: Shield,
        },
        {
          title: "Auditoría Completa",
          description:
            "Seguimiento de todas las acciones administrativas con registro de fecha y hora",
          icon: FileText,
        },
        {
          title: "Sesiones Seguras",
          description:
            "Sistema de autenticación seguro con códigos de un solo uso y sesiones encriptadas",
          icon: Lock,
        },
        {
          title: "Restricciones por Club",
          description:
            "Cada admin solo ve y gestiona su propio club con aislamiento completo de datos",
          icon: Building2,
        },
      ],
    },
    {
      category: "Funciones Avanzadas",
      icon: Sparkles,
      items: [
        {
          title: "Apps Móviles Personalizadas",
          description:
            "Aplicaciones iOS y Android completamente personalizadas con tu marca, logo y colores corporativos",
          icon: Smartphone,
        },
        {
          title: "Clases Privadas",
          description:
            "Sistema completo para gestionar instructores, disponibilidad y clases individuales o grupales",
          icon: GraduationCap,
        },
        {
          title: "Políticas Personalizadas",
          description:
            "Define tus propios términos, política de privacidad y política de cancelación",
          icon: FileText,
        },
        {
          title: "Precios Dinámicos",
          description:
            "Configura precios base, horarios premium y descuentos por duración",
          icon: DollarSign,
        },
        {
          title: "Notificaciones Automáticas",
          description:
            "Sistema de recordatorios automáticos para reservas próximas y confirmaciones",
          icon: Bell,
        },
      ],
    },
  ];

  const benefits = [
    {
      title: "Ahorra Tiempo",
      description: "Automatiza el 80% de las tareas administrativas diarias",
      icon: Clock,
    },
    {
      title: "Aumenta Ingresos",
      description: "Maximiza la ocupación con reservas en línea 24/7",
      icon: TrendingUp,
    },
    {
      title: "Reduce Errores",
      description: "Elimina dobles reservas y errores de gestión manual",
      icon: CheckCircle2,
    },
    {
      title: "Mejora Experiencia",
      description: "Ofrece una experiencia moderna a tus clientes",
      icon: Star,
    },
  ];

  const pricingPlan = {
    name: "Plan Completo",
    setupPrice: "$16,000",
    setupPeriod: "MXN pago único",
    commission: "Comisión por transacción",
    setupDescription:
      "Inversión inicial única para setup y personalización completa",
    commissionDescription:
      "Modelo flexible - Solo pagas comisión cuando tu club genera ingresos",
    setupFeatures: [
      "Desarrollo y personalización completa de tu aplicación móvil",
      "Diseño con tu marca: logo, colores corporativos, y nombre del club",
      "Publicación en Apple App Store (iOS)",
      "Publicación en Google Play Store (Android)",
      "Configuración completa del CRM",
      "Integración de pasarela de pagos (Stripe)",
      "Migración de tu base de datos actual",
      "Capacitación completa para tu equipo",
      "Soporte durante la implementación",
    ],
    commissionFeatures: [
      "Comisión baja por transacción",
      "Uso ilimitado de la plataforma",
      "Procesamiento de pagos",
      "Mantenimiento y actualizaciones",
      "Soporte técnico continuo",
      "Servidores",
      "Mejoras y nuevas funcionalidades",
      "Sin límites de reservas",
      "Sin límites de usuarios",
      "Sin costos ocultos",
    ],
    cta: "Comenzar Ahora",
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-white">
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
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                Plataforma Profesional para Clubes
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Moderniza Tu Club de Pádel
            </motion.h1>

            <motion.p
              className="text-xl text-white/90 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Sistema completo de gestión para automatizar reservas, gestionar
              jugadores, organizar eventos y hacer crecer tu negocio. Todo desde
              un panel intuitivo y poderoso.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 shadow-2xl shadow-primary/50"
                asChild
              >
                <Link to="/club-onboarding">
                  Registrar Mi Club
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold text-lg px-8 backdrop-blur-sm"
                asChild
              >
                <a href="#pricing">Ver Planes</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              ¿Por Qué Intelipadel?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Más que un sistema de reservas. Una solución completa para tu
              club.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-xl transition-all h-full">
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Características Completas
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Todo lo que necesitas para administrar tu club de pádel de forma
              profesional y eficiente
            </p>
          </div>

          <div className="space-y-16">
            {features.map((category, catIdx) => (
              <div key={catIdx}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl text-secondary font-bold">
                    {category.category}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {category.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-all h-full">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">
                              {item.title}
                            </h4>
                            <p className="text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Inversión Clara y Transparente
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un pago único para comenzar, sin mensualidades. Solo comisión por
              transacción cuando tu club genera ingresos.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="p-8 border-2 border-primary shadow-2xl">
              <div className="text-center mb-8">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold inline-block mb-4">
                  Plan Completo
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  Todo lo que necesitas para digitalizar tu club
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Setup Investment */}
                <div className="border-r md:pr-8">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold mb-2">
                      Inversión Inicial Única
                    </h4>
                    <div className="mb-4">
                      <span className="text-4xl font-black">
                        {pricingPlan.setupPrice}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {pricingPlan.setupPeriod}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {pricingPlan.setupDescription}
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {pricingPlan.setupFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Commission Model */}
                <div className="md:pl-8">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-secondary mb-2">
                      Sin Mensualidades
                    </h4>
                    <div className="mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      {pricingPlan.commissionDescription}
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {pricingPlan.commissionFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">✨ {feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-lg px-12"
                  asChild
                >
                  <Link to="/club-onboarding">
                    {pricingPlan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Modernizar Tu Club?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Únete a los clubes líderes que ya confían en Intelipadel. Comienza
            tu prueba gratuita hoy, sin tarjeta de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8"
              asChild
            >
              <Link to="/club-onboarding">
                Registrar Mi Club
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
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
                La plataforma profesional para clubes de pádel modernos.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <Link to="/" className="hover:text-white transition">
                    Para Jugadores
                  </Link>
                </li>
                <li>
                  <Link to="/for-clubs" className="hover:text-white transition">
                    Para Clubes
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
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
                    Documentación
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
            <p>
              © 2024 Intelipadel. Todos los derechos reservados. Gestión
              inteligente para clubes modernos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Building2 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

const GraduationCap = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const DollarSign = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
