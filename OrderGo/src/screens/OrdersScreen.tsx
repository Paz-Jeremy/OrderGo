import React from "react";
import { StyleSheet, SafeAreaView, FlatList, View, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import OrderStatusCard, { OrderStatus } from "../components/OrderStatusCard";

// Array simulado de pedidos con diferentes estados
const MOCK_ORDERS = [
  {
    id: "101",
    table: "4",
    status: "pending" as OrderStatus,
    time: "10:15 AM",
    total: 215.0,
  },
  {
    id: "102",
    table: "2",
    status: "cooking" as OrderStatus,
    time: "10:05 AM",
    total: 450.0,
  },
  {
    id: "103",
    table: "7",
    status: "ready" as OrderStatus,
    time: "09:50 AM",
    total: 180.5,
  },
  {
    id: "104",
    table: "1",
    status: "delivered" as OrderStatus,
    time: "09:30 AM",
    total: 320.0,
  },
  {
    id: "105",
    table: "5",
    status: "pending" as OrderStatus,
    time: "10:22 AM",
    total: 90.0,
  },
];

export default function OrdersScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Pedidos Actuales
        </Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <OrderStatusCard
            orderId={item.id}
            tableNumber={item.table}
            status={item.status}
            time={item.time}
            total={item.total}
            onPress={() => {
              // Aquí despues voy navegar al OrderDetail pasando el ID del pedido
              console.log(`Ver detalles del pedido #${item.id}`);
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay pedidos en este momento.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
