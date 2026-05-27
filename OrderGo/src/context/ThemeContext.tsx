import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeColors } from "../utils/types/ThemeColors";

type ThemeMode = "light" | "dark";

const lightColors: ThemeColors = {
  background: "",
  buttonPrimaryBg: "#2563eb",
  buttonPrimaryText: "#fff",
  buttonSecondaryBg: "#f3f4f6",
  buttonSecondaryText: "#1f2937",
  buttonTertiaryBg: "transparent",
  buttonTertiaryText: "#4b5563",
  text: "",
  textSecondary: "",
  primary: "",
  secondary: "",
  inputBackground: ""
};

const darkColors: ThemeColors = {
  background: "",
  buttonPrimaryBg: "#3b82f6",
  buttonPrimaryText: "#fff",
  buttonSecondaryBg: "#374151",
  buttonSecondaryText: "#f9fafb",
  buttonTertiaryBg: "transparent",
  buttonTertiaryText: "#9ca3af",
  text: "",
  textSecondary: "",
  primary: "",
  secondary: "",
  inputBackground: ""
};

type ThemeContextType = {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
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
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
