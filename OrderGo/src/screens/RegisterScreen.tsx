import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { useTheme } from "../contexts/ThemeContext";
import CustomDropdown from "../components/CustomDropdown";
import { useAuth } from "../contexts/AuthContext";

type Role = "waiter" | "kitchen" | "admin";

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");

  const [isLoading, setIsLoading] = useState(false);

  const rolesOptions = [
    { label: "Administrador", value: "admin" },
    { label: "Mesero", value: "waiter" },
    { label: "Cocina", value: "kitchen" },
  ];

  const handleRegister = async () => {
    if (!name.trim() || !role.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Campos obligatorios",
        "Todos los campos deben estar completos.",
      );
      return;
    }

    setIsLoading(true);

    const success = await register(
      name.trim(),
      role as Role,
      email.trim(),
      password,
    );

    setIsLoading(false);

    if (success) {
      navigation.navigate("Login");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View
          style={[styles.formContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.inputText }]}>
              Registro
            </Text>
            <Text style={[styles.subtitle, { color: colors.inputPlaceholder }]}>
              Por favor, rellene el formulario para continuar.
            </Text>
          </View>

          <CustomInput
            placeholder="Ingresa tu nombre"
            value={name}
            onChange={setName}
          />

          <CustomInput
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={setEmail}
          />

          <CustomInput
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={setPassword}
          />

          <CustomDropdown
            placeholder="Selecciona un rol"
            options={rolesOptions}
            selectedValue={role}
            onSelect={(value) => setRole(value as Role)}
          />

          <View style={styles.buttonWrapper}>
            <CustomButton
              title="Registrar"
              loading={isLoading}
              onPress={handleRegister}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  buttonWrapper: {
    marginTop: 24,
    gap: 10,
  },
});
