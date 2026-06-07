import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  type?: "text" | "email" | "password" | "number";
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
};

export default function CustomInput({
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  const { colors } = useTheme(); // Consumimos los colores del tema actual
  const [isSecureText, setIsSecureText] = useState(type === "password");
  const isPasswordField = type === "password";

  const icon: (typeof MaterialIcons)["name"] | undefined =
    type === "email"
      ? "alternate-email"
      : type === "password"
        ? "lock"
        : undefined;

  const keyboardType: KeyboardTypeOptions =
    type === "email"
      ? "email-address"
      : type === "number"
        ? "phone-pad"
        : "default";

  const getError = () => {
    if (!value) return undefined; // Evita mostrar error si el usuario no ha escrito nada
    if (type === "email" && !value.includes("@")) return "Correo inválido";
    if (type === "password" && value.length < 4)
      return "La contraseña es muy débil";
  };

  const error = getError();

  return (
    <View style={styles.wrapper}>
      {/* Contenedor del Input con colores dinámicos */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? "#ef4444" : colors.inputBorder, // Rojo en error, si no, color del tema
          },
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={22}
            color={colors.inputPlaceholder} // El icono toma el color del placeholder para hacer juego
            style={styles.iconLeft}
          />
        )}

        <TextInput
          style={[styles.input, { color: colors.inputText }]}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder} // Propiedad clave para modo oscuro
          value={value}
          onChangeText={onChange}
          secureTextEntry={isSecureText}
          keyboardType={keyboardType}
        />

        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setIsSecureText(!isSecureText)}
            style={styles.iconRight}
          >
            <Ionicons
              name={isSecureText ? "eye" : "eye-off"}
              size={22}
              color={colors.inputPlaceholder}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Texto de error */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  iconRight: {
    padding: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 4,
    paddingLeft: 4,
  },
});
