import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import OrderStatusCard, { OrderStatus } from "../components/OrderStatusCard";
import { supabase } from "../services/supabaseClient";
import { useAppDispatch } from "../store/hooks";
import { loadOrderForEditing } from "../store/orderTabsSlice";

type OrderListItem = {
  id: string;
  status: OrderStatus;
  created_at: string | null;
  total: number;
  tableNumber: number;
};

const formatOrderTime = (createdAt: string | null) => {
  if (!createdAt) return "Sin fecha";

  return new Date(createdAt).toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrdersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    const { data, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
          id,
          status,
          created_at,
          total,
          tables(id, table_number, status)
        `,
      )
      .neq("status", "delivered")
      .order("created_at", { ascending: false });

    if (ordersError) {
      setError(ordersError.message);
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const mappedOrders: OrderListItem[] = (data ?? []).map((item: any) => {
      const table = Array.isArray(item.tables) ? item.tables[0] : item.tables;

      return {
        id: item.id,
        status: item.status as OrderStatus,
        created_at: item.created_at ?? null,
        total: Number(item.total ?? 0),
        tableNumber: Number(table?.table_number ?? 0),
      };
    });

    setOrders(mappedOrders);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const handleOpenOrder = async (order: OrderListItem) => {
    if (order.status === "delivered") {
      Alert.alert(
        "Pedido finalizado",
        "Este pedido ya fue finalizado y no se puede abrir.",
      );
      return;
    }

    const result = await dispatch(loadOrderForEditing({ orderId: order.id }));

    if (loadOrderForEditing.fulfilled.match(result)) {
      navigation.navigate("OrderTabs", { screen: "Details" });
      return;
    }

    Alert.alert(
      "Error",
      result.payload?.toString() ?? "No se pudo cargar el pedido.",
    );

    fetchOrders(true);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Pedidos Actuales
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Toca un pedido para cargarlo y editarlo.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Cargando pedidos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
            />
          }
          renderItem={({ item }) => (
            <OrderStatusCard
              orderId={item.id.slice(0, 8)}
              tableNumber={String(item.tableNumber)}
              status={item.status}
              time={formatOrderTime(item.created_at)}
              total={item.total}
              onPress={() => handleOpenOrder(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay pedidos activos en este momento.
            </Text>
          }
        />
      )}
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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 16,
    paddingHorizontal: 16,
  },
});