import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  tableNumber: string;
  status: string;
  onPress: () => void;
};

const getStatusTheme = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("available")) {
    return { bg: "#E8F5E9", text: "#2E7D32" };
  }
  if (normalizedStatus.includes("occupied")) {
    return { bg: "#FFEBEE", text: "#C62828" };
  }

  return { bg: "#F3F4F6", text: "#6B7280" };
};

export default function TableStatusCard({
  tableNumber,
  status,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const statusTheme = getStatusTheme(status);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.inputBackground || "#FFFFFF",
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Círculo con el número de mesa */}
      <View style={[styles.iconContainer, { backgroundColor: statusTheme.bg }]}>
        <Text style={[styles.tableNumberText, { color: statusTheme.text }]}>
          {tableNumber}
        </Text>
      </View>

      {/* Título de la mesa */}
      <Text style={[styles.title, { color: colors.inputText || "#1F2937" }]}>
        Mesa: #{tableNumber}
      </Text>

      {/* Insignia (Badge) de Estado */}
      <View style={[styles.badge, { backgroundColor: statusTheme.bg }]}>
        <Text style={[styles.badgeText, { color: statusTheme.text }]}>
          {status == "available" ? "Disponible" : "Ocupada"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    margin: 8,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-around",

    // Sombras para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    // Sombras para Android
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tableNumberText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
