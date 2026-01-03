import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, User, LogOut, Calendar, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { fetchUserSubscription } from "@/store/slices/userSubscriptionsSlice";
import AuthModal from "./auth/AuthModal";
import SubscriptionBadge from "./subscription/SubscriptionBadge";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { userSubscription } = useAppSelector(
    (state) => state.userSubscriptions,
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserSubscription(user.id));
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const nameParts = user.name?.split(" ") || [];
    if (nameParts.length >= 2) {
      return (
        nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return user.name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-white/80 backdrop-blur-xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-primary-foreground font-bold text-sm">
                    P
                  </span>
                </div>
                <span className="font-bold text-xl text-secondary hidden sm:inline bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                  Intelipadel
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {/* <Link
                to="/clubs"
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group"
              >
                <span>Clubes</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              {isAuthenticated && (
                <Link
                  to="/bookings"
                  className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group"
                >
                  <span>Mis Reservas</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
              <Link
                to="/about"
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group"
              >
                <span>Acerca de</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link> */}
            </nav>

            {/* Desktop Auth / User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 rounded-full hover:bg-white/50"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    {userSubscription &&
                      userSubscription.status === "active" && (
                        <div className="px-2 py-1.5">
                          <SubscriptionBadge
                            subscriptionName={
                              userSubscription.subscription?.name || ""
                            }
                            size="sm"
                          />
                        </div>
                      )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mis Reservas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Crear Cuenta
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                    asChild
                  >
                    <Link to="/booking">Reservar Ahora</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                {mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileOpen && (
            <nav className="md:hidden pb-4 space-y-2 backdrop-blur-xl bg-white/50 rounded-lg p-2 mt-2">
              {/* <Link
                to="/clubs"
                className="block px-4 py-2 text-foreground hover:bg-white/70 rounded-lg transition-all duration-300 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              >
                Clubes
              </Link>
              {isAuthenticated && (
                <Link
                  to="/bookings"
                  className="block px-4 py-2 text-foreground hover:bg-white/70 rounded-lg transition-all duration-300 backdrop-blur-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Mis Reservas
                </Link>
              )}
              <Link
                to="/about"
                className="block px-4 py-2 text-foreground hover:bg-white/70 rounded-lg transition-all duration-300 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              >
                Acerca de
              </Link> */}

              <div className="pt-2 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 border-t border-white/30 mt-2 pt-3">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-foreground hover:bg-white/70 rounded-lg transition-all duration-300 backdrop-blur-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      <UserCircle className="inline mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="inline mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setAuthModalOpen(true);
                        setMobileOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link to="/booking" onClick={() => setMobileOpen(false)}>
                        Reservar Ahora
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
