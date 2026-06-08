import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";

// 1. Datos simulados (Mesa y Lista de Productos)
const SELECTED_TABLE = "Mesa 4";

const MOCK_ORDER_ITEMS = [
  { id: "1", name: "Baleada Especial", quantity: 5, price: 45 },
  { id: "2", name: "Pollo con Tajadas", quantity: 1, price: 120 },
  { id: "7", name: "Horchata Hondureña", quantity: 2, price: 25 },
];

export default function OrderDetail({ navigation }: any) {
  const { colors } = useTheme();
  const [notes, setNotes] = useState("");

  // 2. Cálculo automático del total de la orden
  const totalAmount = MOCK_ORDER_ITEMS.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // 3. Componente para renderizar cada fila de producto
  const renderOrderItem = ({
    item,
  }: {
    item: (typeof MOCK_ORDER_ITEMS)[0];
  }) => {
    const itemTotal = item.quantity * item.price;

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
            Lps. {item.price.toFixed(2)} c/u
          </Text>
        </View>
        <Text style={[styles.itemTotal, { color: colors.text }]}>
          Lps. {itemTotal.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={MOCK_ORDER_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        // Encabezado con el número de mesa
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Detalle de Orden
            </Text>
            <View
              style={[styles.tableBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.tableBadgeText}>{SELECTED_TABLE}</Text>
            </View>
          </View>
        }
        renderItem={renderOrderItem}
        // Pie de página con Totales, Notas y Botón
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
                Lps. {totalAmount.toFixed(2)}
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
                Lps. {totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: colors.text }]}>
                Notas Especiales
              </Text>
              <CustomInput
                placeholder="Ej. Sin cebolla, extra salsa..."
                value={notes}
                onChange={setNotes}
              />
            </View>

            <CustomButton
              title="Enviar a Cocina"
              onPress={() => {
                console.log("Orden enviada:", {
                  table: SELECTED_TABLE,
                  items: MOCK_ORDER_ITEMS,
                  total: totalAmount,
                  notes: notes,
                }, navigation.navigate("MainMenu"));
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
  footerContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    // Sombras
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
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
});
