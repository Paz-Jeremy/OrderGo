import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";

// Importa el contexto de tu tema (ajusta la ruta según tu proyecto)
import { useTheme } from "../contexts/ThemeContext";
import CustomDropdown from "../components/CustomDropdown";

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme(); // Extraemos los colores dinámicos
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");

  // Definimos las opciones del Dropdown
  const rolesOptions = [
    { label: "Administrador", value: "admin" },
    { label: "Mesero", value: "mesero" },
    { label: "Cocina", value: "cocina" },
  ];

  return (
    // SafeAreaView asegura que el contenido no quede debajo del reloj o el notch
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Evita que el teclado tape los inputs al escribir */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View
          style={[styles.formContainer, { backgroundColor: colors.background }]}
        >
          {/* Textos de bienvenida estilizados */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.inputText }]}>
              Registro
            </Text>
            <Text style={[styles.subtitle, { color: colors.inputPlaceholder }]}>
              Por favor, rellene el formulario para continuar.
            </Text>
          </View>

          {/* Formulario */}

          <CustomInput
            placeholder="Ingresa tu nombre"
            value={name}
            onChange={setName}
          ></CustomInput>

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
            selectedValue={rol}
            onSelect={setRol}
          />

          {/* Contenedor del botón para darle separación */}
          <View style={styles.buttonWrapper}>
            <CustomButton
              title="Registrar"
              onPress={() => console.log("Registrando...")}
            />
            <CustomButton
              variant="secondary"
              title={"Volver a login"}
              onPress={() => console.log("Redirigiendo a login...")}
            ></CustomButton>
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
