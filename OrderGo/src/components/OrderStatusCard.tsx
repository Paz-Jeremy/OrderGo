import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Definimos los estados posibles para un pedido
export type OrderStatus = "pending" | "cooking" | "ready" | "delivered";

type Props = {
  orderId: string;
  tableNumber: string;
  status: OrderStatus;
  time: string;
  total: number;
  onPress: () => void;
};

// Función para obtener los colores y etiquetas según el estado del pedido
const getOrderStatusTheme = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return { bg: "#FEF3C7", text: "#D97706", label: "Pendiente" };
    case "cooking":
      return { bg: "#DBEAFE", text: "#1D4ED8", label: "En Cocina" };
    case "ready":
      return { bg: "#DCFCE7", text: "#15803D", label: "Listo" };
    case "delivered":
      return { bg: "#F3F4F6", text: "#6B7280", label: "Entregado" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", label: "Desconocido" };
  }
};

export default function OrderStatusCard({
  orderId,
  tableNumber,
  status,
  time,
  total,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const statusTheme = getOrderStatusTheme(status);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Encabezado: ID del Pedido y Hora */}
      <View style={styles.headerRow}>
        <Text style={[styles.orderId, { color: colors.text }]}>
          Pedido #{orderId}
        </Text>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {time}
        </Text>
      </View>

      {/* Cuerpo: Información de la Mesa y Total */}
      <View style={styles.bodyRow}>
        <View style={styles.tableInfo}>
          <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
            Mesa
          </Text>
          <Text style={[styles.tableNumber, { color: colors.text }]}>
            {tableNumber}
          </Text>
        </View>

        <View style={styles.totalInfo}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>
            Lps. {total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Pie: Insignia (Badge) de Estado */}
      <View style={styles.footerRow}>
        <View style={[styles.badge, { backgroundColor: statusTheme.bg }]}>
          <Text style={[styles.badgeText, { color: statusTheme.text }]}>
            {statusTheme.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    // Sombras para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Sombras para Android
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tableInfo: {
    alignItems: "flex-start",
  },
  totalInfo: {
    alignItems: "flex-end",
  },
  tableLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "900",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
