import { createContext, useContext, useState } from "react";
import { supabase } from "../services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

//1. Tipado de objeto principal del contexto
type User = {
  token: string;
  role: string;
  name: string;
  email: string;
  pwd?: string;
} | null;

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    role: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => void;
};

//2. Creacion del contexto
const AuthContext = createContext<AuthContextType | null>(null);

//4. exposicion de contexto en forma de hook personalizdo
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

//3. Crear el Provider: medio por el cual se maneja el estado global
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const setUserSession = (data: any) => {
    const session = data.session;

    if (session && session.user) {
      setUser({
        token: session.access_token,
        role: session.user.user_metadata.role,
        email: session.user.email,
        name: session.user.user_metadata.name,
      });
      AsyncStorage.setItem("token", session.access_token);
    } else {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Error al iniciar sesion", error.message);
      return false;
    }

    setUserSession(data);
    return true;
  };

  const register = async (
    name: string,
    role: string,
    email: string,
    password: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role,
        },
      },
    });

    if (error) {
      Alert.alert("Error al registrar", error.message);
      return false;
    }

    Alert.alert(
      "¡Registro exitoso!",
      "La cuenta fue creada correctamente. Verifica tu correo electrónico si la confirmación está habilitada.",
    );
    console.log("Usuario registrado:", data.user);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
