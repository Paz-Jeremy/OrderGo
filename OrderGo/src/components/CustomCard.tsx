import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  iconBackgroundColor: string;
  onPress: () => void;
};

export default function CustomCard({
  title,
  subtitle,
  iconName,
  iconColor,
  iconBackgroundColor,
  onPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor:
            colors.background === "" ? "#FFFFFF" : colors.inputBackground, // Fallback a blanco en modo claro
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Contenedor del ícono con color dinámico */}
      <View
        style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}
      >
        <MaterialCommunityIcons name={iconName} size={32} color={iconColor} />
      </View>

      {/* Textos */}
      <Text style={[styles.title, { color: colors.inputText }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.inputPlaceholder }]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, // Permite que las tarjetas se adapten al espacio de la cuadrícula
    margin: 8,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",

    // Sombras para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Sombras para Android
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32, // La mitad del ancho/alto para que sea un círculo perfecto
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
