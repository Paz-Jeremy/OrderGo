import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import CustomDropdown from "../components/CustomDropdown";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../services/supabaseClient";

export type KitchenOrderStatus = "pending" | "preparing" | "ready";

type KitchenOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  notes: string | null;
};

type KitchenOrder = {
  id: string;
  status: KitchenOrderStatus;
  created_at: string | null;
  notes: string | null;
  customerName: string | null;
  tableNumber: number;
  items: KitchenOrderItem[];
};

const STATUS_OPTIONS: { label: string; value: KitchenOrderStatus }[] = [
  { label: "Pendiente", value: "pending" },
  { label: "Preparando", value: "preparing" },
  { label: "Listo", value: "ready" },
];

const STATUS_LABELS: Record<KitchenOrderStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
};

const formatOrderTime = (createdAt: string | null) => {
  if (!createdAt) return "Sin fecha";

  return new Date(createdAt).toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function KitchenOrdersScreen() {
  const { colors } = useTheme();

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
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
          notes,
          customer_name,
          tables(id, table_number),
          order_items(
            id,
            quantity,
            notes,
            products(id, name)
          )
        `,
      )
      .neq("status", "delivered")
      .order("created_at", { ascending: true });

    if (ordersError) {
      setError(ordersError.message);
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const mappedOrders: KitchenOrder[] = (data ?? []).map((item: any) => {
      const table = Array.isArray(item.tables) ? item.tables[0] : item.tables;

      return {
        id: item.id,
        status: item.status as KitchenOrderStatus,
        created_at: item.created_at ?? null,
        notes: item.notes ?? null,
        customerName: item.customer_name ?? null,
        tableNumber: Number(table?.table_number ?? 0),
        items: (item.order_items ?? []).map((orderItem: any) => {
          const product = Array.isArray(orderItem.products)
            ? orderItem.products[0]
            : orderItem.products;

          return {
            id: orderItem.id,
            productName: product?.name ?? "Producto sin nombre",
            quantity: Number(orderItem.quantity ?? 0),
            notes: orderItem.notes ?? null,
          };
        }),
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

  const handleChangeStatus = async (
    order: KitchenOrder,
    status: KitchenOrderStatus,
  ) => {
    if (order.status === status) return;

    setUpdatingOrderId(order.id);

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);

    setUpdatingOrderId(null);

    if (updateError) {
      Alert.alert("Error", updateError.message);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? { ...currentOrder, status }
          : currentOrder,
      ),
    );
  };

  const renderOrder = ({ item }: { item: KitchenOrder }) => {
    const isUpdating = updatingOrderId === item.id;

    return (
      <View
        style={[
          styles.orderCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderTitle, { color: colors.text }]}>
              Pedido #{item.id.slice(0, 8)}
            </Text>

            <Text
              style={[styles.orderSubtitle, { color: colors.textSecondary }]}
            >
              Mesa {item.tableNumber} · {formatOrderTime(item.created_at)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {item.customerName ? (
          <Text style={[styles.customerName, { color: colors.textSecondary }]}>
            Cliente: {item.customerName}
          </Text>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Productos
        </Text>

        {item.items.map((orderItem) => (
          <View key={orderItem.id} style={styles.itemRow}>
            <Text style={[styles.itemText, { color: colors.text }]}>
              {orderItem.quantity}x {orderItem.productName}
            </Text>

            {orderItem.notes ? (
              <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>
                Nota: {orderItem.notes}
              </Text>
            ) : null}
          </View>
        ))}

        {item.notes ? (
          <View
            style={[
              styles.notesBox,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Notas generales
            </Text>

            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        <View style={styles.statusSelector}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Cambiar estado
          </Text>

          <CustomDropdown
            placeholder="Estado del pedido"
            options={STATUS_OPTIONS}
            selectedValue={item.status}
            onSelect={(value) =>
              handleChangeStatus(item, value as KitchenOrderStatus)
            }
          />

          {isUpdating ? (
            <Text
              style={[styles.updatingText, { color: colors.textSecondary }]}
            >
              Actualizando estado...
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Pedidos para cocina
        </Text>

        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Consulta los productos del pedido y actualiza su estado.
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
          renderItem={renderOrder}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay pedidos activos para cocina.
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
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  orderSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  customerName: {
    fontSize: 14,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  itemRow: {
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemNotes: {
    fontSize: 13,
    marginTop: 3,
    paddingLeft: 8,
  },
  notesBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
  },
  statusSelector: {
    marginTop: 8,
  },
  updatingText: {
    fontSize: 13,
    textAlign: "center",
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
