import { useState, useEffect } from "react";

interface ScreensaverModeProps {
  isActive: boolean;
  onExit: () => void;
  clubName?: string;
  clubLogo?: string;
}

export default function ScreensaverMode({
  isActive,
  onExit,
  clubName,
  clubLogo,
}: ScreensaverModeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second when active
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center cursor-pointer"
      onClick={onExit}
    >
      <div className="text-center space-y-8 px-4 animate-fade-in">
        {/* Time Display */}
        <div className="space-y-2">
          <div className="text-9xl md:text-[12rem] font-bold text-white tabular-nums tracking-tight">
            {currentTime.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
          <div className="text-3xl md:text-4xl text-gray-300 font-light">
            {currentTime.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Club Info */}
        {clubName && (
          <div className="flex items-center justify-center gap-4 mt-12">
            {clubLogo && (
              <img
                src={clubLogo}
                alt={clubName}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="text-left">
              <div className="text-2xl text-white font-semibold">
                {clubName}
              </div>
              <div className="text-gray-400 text-sm">
                Panel de Administración
              </div>
            </div>
          </div>
        )}

        {/* Hint to exit */}
        <div className="text-gray-500 text-sm mt-16 animate-pulse">
          Toca la pantalla o mueve el ratón para continuar
        </div>

        {/* Powered by */}
        <div className="text-gray-600 text-xs mt-8">by Intelipadel.com</div>
      </div>
    </div>
  );
}
