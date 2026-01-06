import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  logoutAdmin,
  validateAdminSession,
} from "@/store/slices/adminAuthSlice";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Shield,
  Settings,
  CalendarOff,
  Trophy,
  GraduationCap,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  Maximize2,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ScreensaverMode from "./ScreensaverMode";

// Import admin section components
import {
  AdminDashboard,
  AdminBookings,
  AdminPlayers,
  AdminCourts,
  AdminUsers,
  AdminSettings,
  AdminBlockedDates,
  AdminEvents,
  AdminClasses,
  AdminPayments,
  AdminPolicies,
  AdminSubscriptions,
} from "./sections";

type Section =
  | "dashboard"
  | "bookings"
  | "players"
  | "courts"
  | "admin-users"
  | "settings"
  | "blocked-dates"
  | "events"
  | "classes"
  | "payments"
  | "policies"
  | "subscriptions";

const navigationItems = [
  {
    id: "dashboard" as Section,
    label: "Panel Principal",
    icon: LayoutDashboard,
  },
  { id: "bookings" as Section, label: "Calendario", icon: Calendar },
  { id: "players" as Section, label: "Jugadores", icon: Users },
  { id: "events" as Section, label: "Eventos", icon: Trophy },
  { id: "classes" as Section, label: "Clases Privadas", icon: GraduationCap },
  { id: "subscriptions" as Section, label: "Suscripciones", icon: Crown },
  { id: "courts" as Section, label: "Gestión de Canchas", icon: Building2 },
  { id: "admin-users" as Section, label: "Usuarios Admin", icon: Shield },
  {
    id: "blocked-dates" as Section,
    label: "Fechas Bloqueadas",
    icon: CalendarOff,
  },
  { id: "payments" as Section, label: "Pagos", icon: CreditCard },
  { id: "policies" as Section, label: "Términos y Políticas", icon: FileText },
  { id: "settings" as Section, label: "Configuración", icon: Settings },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.adminAuth);
  const [activeSection, setActiveSection] = useState<Section>(() => {
    // Restore last active section from localStorage
    const saved = localStorage.getItem("adminActiveSection");
    return (saved as Section) || "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screensaverMode, setScreensaverMode] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save active section to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("adminActiveSection", activeSection);
  }, [activeSection]);

  // Inactivity detection (3 minutes)
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (!screensaverMode) {
        inactivityTimerRef.current = setTimeout(
          () => {
            setScreensaverMode(true);
          },
          3 * 60 * 1000,
        ); // 3 minutes
      }
    };

    const handleActivity = () => {
      if (screensaverMode) {
        setScreensaverMode(false);
      }
      resetInactivityTimer();
    };

    // Listen for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [screensaverMode]);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleScreensaver = () => {
    setScreensaverMode(!screensaverMode);
  };

  const exitScreensaver = () => {
    setScreensaverMode(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "bookings":
        return <AdminBookings />;
      case "players":
        return <AdminPlayers />;
      case "courts":
        return <AdminCourts />;
      case "admin-users":
        return <AdminUsers />;
      case "blocked-dates":
        return <AdminBlockedDates />;
      case "events":
        return <AdminEvents />;
      case "classes":
        return <AdminClasses />;
      case "subscriptions":
        return <AdminSubscriptions />;
      case "payments":
        return <AdminPayments />;
      case "policies":
        return <AdminPolicies />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Screensaver Mode */}
      <ScreensaverMode
        isActive={screensaverMode}
        onExit={exitScreensaver}
        clubName={admin?.club_name}
        clubLogo={admin?.club_logo}
      />

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card backdrop-blur-xl border-r border-border shadow-2xl transform transition-all duration-300 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/20 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Club Logo or Default Icon */}
                {admin?.club_logo ? (
                  <div className="flex flex-col items-center gap-2 animate-fade-in-up">
                    <div className="relative group">
                      <img
                        src={admin.club_logo}
                        alt={admin.club_name || "Club"}
                        className="h-16 w-16 rounded-lg object-cover border-2 border-primary shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {admin.club_name && (
                      <h2 className="text-base font-bold text-center">
                        {admin.club_name}
                      </h2>
                    )}
                    <p className="text-xs text-gray-400">by InteliPadel</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 animate-fade-in-up">
                    <div className="relative">
                      <Shield className="h-8 w-8 text-primary animate-pulse-slow" />
                      <div className="absolute inset-0 bg-primary rounded-lg blur-lg opacity-20 animate-pulse-slow" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-primary">
                        InteliPadel
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        Panel Admin
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden absolute top-4 right-4"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                // Hide Admin Users section for club admins
                if (
                  item.id === "admin-users" &&
                  admin?.role !== "super_admin"
                ) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "text-foreground hover:bg-muted hover:scale-102 hover:shadow-md",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                        isActive ? "scale-110" : "group-hover:scale-110",
                      )}
                    />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 opacity-20 animate-pulse-slow" />
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Profile & Logout */}
          <div className="border-t border-border p-4 bg-muted/10">
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200 cursor-pointer group">
              <Avatar className="ring-2 ring-border group-hover:ring-primary transition-all duration-200 group-hover:scale-110">
                <AvatarFallback className="bg-muted font-bold">
                  {admin ? getInitials(admin.name) : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{admin?.name}</p>
                <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
                {admin?.role && (
                  <p className="text-xs text-primary font-medium capitalize">
                    {admin.role.replace("_", " ")}
                  </p>
                )}
              </div>
            </div>
            <Separator className="my-2 bg-border" />
            <Button
              variant="ghost"
              className="w-full justify-start text-muted hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md group"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between shadow-sm relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            {admin?.club_logo ? (
              <>
                <img
                  src={admin.club_logo}
                  alt={admin.club_name || "Club"}
                  className="h-8 w-8 rounded object-cover"
                />
                {admin.club_name && (
                  <span className="font-semibold text-sm">
                    {admin.club_name}
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="relative">
                  <Shield className="h-6 w-6 text-primary" />
                  <div className="absolute inset-0 bg-primary rounded blur-lg opacity-20" />
                </div>
                <span className="font-semibold text-primary">
                  InteliPadel Admin
                </span>
              </>
            )}
          </div>
        </header>

        {/* Section Content */}
        <div className="flex-1 overflow-auto relative z-10 animate-fade-in">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
