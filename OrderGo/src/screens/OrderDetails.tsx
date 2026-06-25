import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTabNotes, submitOrderTab } from "../store/orderTabsSlice";
import {
  selectActiveTab,
  selectActiveTabTotals,
} from "../store/orderTabsSelectors";

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

  const renderOrderItem = ({
    item,
  }: {
    item: (typeof activeTab.items)[number];
  }) => {
    const itemTotal = item.quantity * item.unitPrice;

    return (
      <View style={styles.itemRow}>
        <View style={styles.itemQuantityContainer}>
          <Text style={[styles.itemQuantity, { color: colors.primary }]}>
            {item.quantity}x
          </Text>
        </View>

        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.itemPriceUnit, { color: colors.textSecondary }]}>
            Lps. {item.unitPrice.toFixed(2)} c/u
          </Text>

          {item.notes ? (
            <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>
              Nota: {item.notes}
            </Text>
          ) : null}
        </View>

        <View style={styles.itemActions}>
          <Text style={[styles.itemTotal, { color: colors.text }]}>
            Lps. {itemTotal.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={activeTab.items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
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

            <CustomButton
              title="Enviar a Cocina"
              onPress={async () => {
                const result = await dispatch(
                  submitOrderTab({ tabId: activeTab.tabId }),
                );

                if (submitOrderTab.fulfilled.match(result)) {
                  // Configuramos la navegación para que ocurra HASTA que toquen OK
                  Alert.alert("Éxito", "Orden enviada correctamente.", [
                    {
                      text: "OK",
                      onPress: () => navigation.navigate("MainMenu"),
                    },
                  ]);
                } else {
                  Alert.alert("Error", "No se pudo enviar la orden.");
                }
              }}
            />
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
    marginBottom: 24,
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  itemQuantityContainer: {
    width: 40,
  },
  itemQuantity: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDetails: {
    flex: 1,
    paddingRight: 10,
  },
  itemActions: {
    alignItems: "flex-end",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPriceUnit: {
    fontSize: 14,
  },
  itemNotes: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: "italic",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    marginTop: 24,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});
