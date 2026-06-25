import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CustomDropdown from "../components/CustomDropdown";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  finishOrderTab,
  removeItemFromTab,
  setTabNotes,
  setTabStatus,
  setTabTableStatus,
  submitOrderTab,
  updateItemNotes,
  updateItemQuantity,
} from "../store/orderTabsSlice";
import type { OrderStatus } from "../store/orderTabsSlice";
import type { RestaurantTableStatus } from "../store/tablesSlice";
import {
  selectActiveTab,
  selectActiveTabTotals,
} from "../store/orderTabsSelectors";

const ORDER_STATUS_OPTIONS: {
  label: string;
  value: Exclude<OrderStatus, "draft" | "delivered">;
}[] = [
  { label: "Pendiente", value: "pending" },
  { label: "Preparando", value: "preparing" },
  { label: "Listo", value: "ready" },
];

const TABLE_STATUS_OPTIONS: { label: string; value: RestaurantTableStatus }[] =
  [
    { label: "Disponible", value: "available" },
    { label: "Ocupada", value: "occupied" },
  ];

export default function OrderDetail({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const activeTab = useAppSelector(selectActiveTab);
  const totals = useAppSelector(selectActiveTabTotals);

  if (!activeTab) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay una orden activa.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const canEditItems = activeTab.status !== "delivered";
  const canFinishOrder = activeTab.synced && !!activeTab.remoteOrderId;

  const goBackAfterSave = (wasSynced: boolean) => {
    const parentNavigation = navigation.getParent?.() ?? navigation;
    parentNavigation.navigate(wasSynced ? "Orders" : "MainMenu");
  };

  const handleSaveOrder = async () => {
    const wasSynced = activeTab.synced;
    const result = await dispatch(submitOrderTab({ tabId: activeTab.tabId }));

    if (submitOrderTab.fulfilled.match(result)) {
      Alert.alert(
        "Éxito",
        wasSynced
          ? "Pedido actualizado correctamente."
          : "Orden enviada correctamente.",
        [
          {
            text: "OK",
            onPress: () => goBackAfterSave(wasSynced),
          },
        ],
      );
    } else {
      Alert.alert(
        "Error",
        result.payload?.toString() ?? "No se pudo guardar la orden.",
      );
    }
  };

  const handleFinishOrder = () => {
    Alert.alert(
      "Finalizar pedido",
      "¿Quieres finalizar este pedido? La mesa quedará disponible y el pedido ya no se podrá abrir.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(
              finishOrderTab({ tabId: activeTab.tabId }),
            );

            if (finishOrderTab.fulfilled.match(result)) {
              Alert.alert("Éxito", "Pedido finalizado correctamente.", [
                {
                  text: "OK",
                  onPress: () => {
                    const parentNavigation =
                      navigation.getParent?.() ?? navigation;
                    parentNavigation.navigate("Orders");
                  },
                },
              ]);
            } else {
              Alert.alert(
                "Error",
                result.payload?.toString() ??
                  "No se pudo finalizar el pedido.",
              );
            }
          },
        },
      ],
    );
  };

  const renderOrderItem = ({
    item,
  }: {
    item: (typeof activeTab.items)[number];
  }) => {
    const itemTotal = item.quantity * item.unitPrice;

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <View style={styles.itemHeaderRow}>
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text
              style={[styles.itemPriceUnit, { color: colors.textSecondary }]}
            >
              Lps. {item.unitPrice.toFixed(2)} c/u
            </Text>
          </View>

          <Text style={[styles.itemTotal, { color: colors.text }]}>
            Lps. {itemTotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { borderColor: colors.inputBorder },
              !canEditItems && styles.disabledAction,
            ]}
            onPress={() =>
              dispatch(
                updateItemQuantity({
                  tabId: activeTab.tabId,
                  productId: item.productId,
                  quantity: item.quantity - 1,
                }),
              )
            }
            disabled={!canEditItems}
          >
            <Text style={[styles.quantityButtonText, { color: colors.text }]}>
              -
            </Text>
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: colors.primary }]}>
            {item.quantity}x
          </Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              { borderColor: colors.inputBorder },
              !canEditItems && styles.disabledAction,
            ]}
            onPress={() =>
              dispatch(
                updateItemQuantity({
                  tabId: activeTab.tabId,
                  productId: item.productId,
                  quantity: item.quantity + 1,
                }),
              )
            }
            disabled={!canEditItems}
          >
            <Text style={[styles.quantityButtonText, { color: colors.text }]}>
              +
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.removeButton, !canEditItems && styles.disabledAction]}
            onPress={() =>
              Alert.alert(
                "Eliminar producto",
                `¿Quitar ${item.name} del pedido?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () =>
                      dispatch(
                        removeItemFromTab({
                          tabId: activeTab.tabId,
                          productId: item.productId,
                        }),
                      ),
                  },
                ],
              )
            }
            disabled={!canEditItems}
          >
            <Text style={styles.removeButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        <CustomInput
          placeholder="Nota del producto"
          value={item.notes ?? ""}
          onChange={(text) =>
            dispatch(
              updateItemNotes({
                tabId: activeTab.tabId,
                productId: item.productId,
                notes: text,
              }),
            )
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={activeTab.items}
        keyExtractor={(item, index) =>
          `${item.orderItemId ?? item.productId}-${index}`
        }
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Detalle de Orden
              </Text>

              <View
                style={[styles.tableBadge, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.tableBadgeText}>{activeTab.tableName}</Text>
              </View>
            </View>

            {activeTab.remoteOrderId ? (
              <Text
                style={[styles.remoteIdText, { color: colors.textSecondary }]}
              >
                Pedido en Supabase: {activeTab.remoteOrderId.slice(0, 8)}
              </Text>
            ) : null}

            <View style={styles.statusGrid}>
              <View style={styles.statusInputWrapper}>
                <Text style={[styles.notesLabel, { color: colors.text }]}>
                  Estado del pedido
                </Text>
                <CustomDropdown
                  placeholder="Estado del pedido"
                  options={ORDER_STATUS_OPTIONS}
                  selectedValue={
                    activeTab.status === "draft" ||
                    activeTab.status === "delivered"
                      ? "pending"
                      : activeTab.status
                  }
                  onSelect={(value) =>
                    dispatch(
                      setTabStatus({
                        tabId: activeTab.tabId,
                        status: value as OrderStatus,
                      }),
                    )
                  }
                />
              </View>

              <View style={styles.statusInputWrapper}>
                <Text style={[styles.notesLabel, { color: colors.text }]}>
                  Estado de mesa
                </Text>
                <CustomDropdown
                  placeholder="Estado de mesa"
                  options={TABLE_STATUS_OPTIONS}
                  selectedValue={activeTab.tableStatus}
                  onSelect={(value) =>
                    dispatch(
                      setTabTableStatus({
                        tabId: activeTab.tabId,
                        tableStatus: value as RestaurantTableStatus,
                      }),
                    )
                  }
                />
              </View>
            </View>
          </View>
        }
        renderItem={renderOrderItem}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Esta orden aún no tiene productos.
          </Text>
        }
        ListFooterComponent={
          <View
            style={[
              styles.footerContainer,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryText, { color: colors.textSecondary }]}
              >
                Subtotal
              </Text>
              <Text
                style={[styles.summaryText, { color: colors.textSecondary }]}
              >
                Lps. {totals.subtotal.toFixed(2)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryRow,
                styles.totalRow,
                { borderTopColor: colors.inputBorder },
              ]}
            >
              <Text style={[styles.totalText, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalAmountText, { color: colors.primary }]}>
                Lps. {totals.total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: colors.text }]}>
                Notas Especiales
              </Text>
              <CustomInput
                placeholder="Ej. Sin cebolla, extra salsa..."
                value={activeTab.notes}
                onChange={(text) =>
                  dispatch(setTabNotes({ tabId: activeTab.tabId, notes: text }))
                }
              />
            </View>

            <View style={styles.footerButtonGroup}>
              <CustomButton
                title={activeTab.synced ? "Guardar cambios" : "Enviar a Cocina"}
                onPress={handleSaveOrder}
              />

              {canFinishOrder ? (
                <CustomButton
                  title="Finalizar pedido"
                  onPress={handleFinishOrder}
                  variant="secondary"
                />
              ) : null}
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tableBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tableBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  remoteIdText: {
    fontSize: 13,
    marginBottom: 16,
  },
  statusGrid: {
    gap: 12,
    marginBottom: 16,
  },
  statusInputWrapper: {
    width: "100%",
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPriceUnit: {
    fontSize: 14,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  quantityButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 38,
    textAlign: "center",
  },
  removeButton: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: "#ef4444",
    fontWeight: "700",
  },
  disabledAction: {
    opacity: 0.4,
  },
  footerContainer: {
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
    marginBottom: 24,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  totalAmountText: {
    fontSize: 22,
    fontWeight: "900",
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  footerButtonGroup: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});