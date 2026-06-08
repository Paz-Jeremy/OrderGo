import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeColors } from "../utils/types/ThemeColors";

type ThemeMode = "light" | "dark";

const lightColors: ThemeColors = {
  background: "#f3f4f6",
  buttonPrimaryBg: "#2563eb",
  buttonPrimaryText: "#fff",
  buttonSecondaryBg: "#e5e7eb",
  buttonSecondaryText: "#1f2937",
  buttonTertiaryBg: "transparent",
  buttonTertiaryText: "#4b5563",
  text: "#111827",
  textSecondary: "#6b7280",
  primary: "#2563eb",
  secondary: "#4b5563",
  inputBackground: "#fff",
  inputBorder: "#d1d5db",
  inputText: "#111827",
  inputPlaceholder: "#9ca3af",
  cardBackground: "#ffffff",
  imagePlaceholder: "#e5e7eb",
  counterBg: "#f3f4f6",
  headerBackground: "#ffffff",
  headerText: "#001f5c",
  tabBarBackground: "#ffffff",
  onSecondary: "#ffffff",
};

const darkColors: ThemeColors = {
  background: "#121212",
  buttonPrimaryBg: "#3b82f6",
  buttonPrimaryText: "#fff",
  buttonSecondaryBg: "#374151",
  buttonSecondaryText: "#f9fafb",
  buttonTertiaryBg: "transparent",
  buttonTertiaryText: "#9ca3af",
  text: "#f9fafb",
  textSecondary: "#9ca3af",
  primary: "#60a5fa",
  secondary: "#9ca3af",
  inputBackground: "#1f2937",
  inputBorder: "#4b5563",
  inputText: "#f9fafb",
  inputPlaceholder: "#6b7280",
  cardBackground: "#1f2937",
  imagePlaceholder: "#374151",
  counterBg: "#374151",
  headerBackground: "#1e1e1e",
  headerText: "#e0e0e0",
  tabBarBackground: "#1e1e1e",
  onSecondary: "#ffffff"
};

type ThemeContextType = {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const colors = theme === "dark" ? darkColors : lightColors;
  const isDark = theme === "dark";

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme === "dark" || storedTheme === "light") {
        setTheme(storedTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    //validacion de contenido de Theme
    const newTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
