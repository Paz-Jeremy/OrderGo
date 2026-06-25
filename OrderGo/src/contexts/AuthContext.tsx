import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";

export type Role = "waiter" | "kitchen" | "admin";

type User = {
  token: string;
  id: string;
  role: Role;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    role: Role,
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

type ProfileRow = {
  id: string;
  name: string;
  role: Role;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUserFromSession = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      await AsyncStorage.removeItem("token");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", session.user.id)
      .single<ProfileRow>();

    const fallbackName =
      (session.user.user_metadata?.name as string | undefined) ??
      session.user.email ??
      "";

    const fallbackRole =
      (session.user.user_metadata?.role as Role | undefined) ?? "waiter";

    setUser({
      token: session.access_token,
      id: session.user.id,
      email: session.user.email ?? "",
      name: !error && profile?.name ? profile.name : fallbackName,
      role: !error && profile?.role ? profile.role : fallbackRole,
    });

    await AsyncStorage.setItem("token", session.access_token);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setUser(null);
          await AsyncStorage.removeItem("token");
        } else {
          await hydrateUserFromSession(data.session);
        }
      } catch {
        setUser(null);
        await AsyncStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await hydrateUserFromSession(session);
      } else {
        setUser(null);
        await AsyncStorage.removeItem("token");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Error al iniciar sesión", error.message);
      return false;
    }

    await hydrateUserFromSession(data.session);
    return true;
  };

  const register = async (
    name: string,
    role: Role,
    email: string,
    password: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      Alert.alert("Error al registrar", error.message);
      return false;
    }

    if (data.session) {
      await hydrateUserFromSession(data.session);
    }

    Alert.alert(
      "¡Registro exitoso!",
      "La cuenta fue creada correctamente. Verifica tu correo electrónico si la confirmación está habilitada.",
    );

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
