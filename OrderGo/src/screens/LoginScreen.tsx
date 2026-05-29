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
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme(); // Extraemos los colores dinámicos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
              ¡Bienvenido!
            </Text>
            <Text style={[styles.subtitle, { color: colors.inputPlaceholder }]}>
              Por favor, inicia sesión para continuar.
            </Text>
          </View>

          {/* Formulario */}
          <CustomInput
            type="email" // Añadí el type "email" para que aparezca el ícono y validación
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

          {/* Contenedor del botón para darle separación */}
          <View style={styles.buttonWrapper}>
            <CustomButton
              title="Iniciar Sesión"
              onPress={() => console.log("Iniciando sesión...")}
            />
            <CustomButton
              variant="secondary"
              title={"Registrarse"}
              onPress={() => console.log("Redirigiendo a registro...")}
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
