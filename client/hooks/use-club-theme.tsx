import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface ClubColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
}

interface ClubThemeContextType {
  colors: ClubColors;
  isLoading: boolean;
  setClubId: (clubId: number | null) => void;
  applyTheme: (colors: ClubColors) => void;
  resetTheme: () => void;
}

const defaultColors: ClubColors = {
  primary_color: "#ea580c",
  secondary_color: "#fb923c",
  accent_color: "#fed7aa",
  text_color: "#1f2937",
  background_color: "#ffffff",
};

const ClubThemeContext = createContext<ClubThemeContextType | undefined>(
  undefined,
);

export const useClubTheme = () => {
  const context = useContext(ClubThemeContext);
  if (!context) {
    throw new Error("useClubTheme must be used within a ClubThemeProvider");
  }
  return context;
};

interface ClubThemeProviderProps {
  children: ReactNode;
  clubId?: number | null;
}

export const ClubThemeProvider = ({
  children,
  clubId: initialClubId,
}: ClubThemeProviderProps) => {
  const [colors, setColors] = useState<ClubColors>(defaultColors);
  const [isLoading, setIsLoading] = useState(false);
  const [clubId, setClubIdState] = useState<number | null>(
    initialClubId || null,
  );

  const applyTheme = (newColors: ClubColors) => {
    setColors(newColors);

    // Apply CSS variables to root
    const root = document.documentElement;
    root.style.setProperty("--club-primary", newColors.primary_color);
    root.style.setProperty("--club-secondary", newColors.secondary_color);
    root.style.setProperty("--club-accent", newColors.accent_color);
    root.style.setProperty("--club-text", newColors.text_color);
    root.style.setProperty("--club-background", newColors.background_color);
  };

  const resetTheme = () => {
    applyTheme(defaultColors);
  };

  const setClubId = (newClubId: number | null) => {
    setClubIdState(newClubId);
  };

  useEffect(() => {
    const fetchClubColors = async () => {
      if (!clubId) {
        resetTheme();
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/clubs/${clubId}/colors`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.colors) {
            applyTheme(data.colors);
          } else {
            resetTheme();
          }
        } else {
          resetTheme();
        }
      } catch (error) {
        console.error("Error fetching club colors:", error);
        resetTheme();
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubColors();
  }, [clubId]);

  return (
    <ClubThemeContext.Provider
      value={{
        colors,
        isLoading,
        setClubId,
        applyTheme,
        resetTheme,
      }}
    >
      {children}
    </ClubThemeContext.Provider>
  );
};
