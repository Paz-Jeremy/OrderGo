import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import ProductCard from "../components/ProductCard";
import CustomDropdown from "../components/CustomDropdown";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addItemToTab } from "../store/orderTabsSlice";
import { selectActiveTab } from "../store/orderTabsSelectors";
import {
  fetchCatalog,
  selectProducts,
  selectCatalogLoading,
  selectCatalogError,
} from "../store/catalogSlice";
import { selectCategoryOptions } from "../store/catalogSelectors";

export default function MenuScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const activeTab = useAppSelector(selectActiveTab);
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectCatalogLoading);
  const error = useAppSelector(selectCatalogError);
  const categoryOptions = useAppSelector(selectCategoryOptions);

  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category_id === categoryFilter;
      return matchesCategory && item.is_available;
    });
  }, [products, categoryFilter]);

  const handleAddProduct = (
    product: (typeof products)[number],
    quantity: number,
  ) => {
    if (!activeTab || activeTab.status !== "draft") {
      Alert.alert(
        "Mesa ocupada",
        "Esta orden ya fue enviada. Selecciona una mesa disponible.",
      );
      return;
    }

    dispatch(
      addItemToTab({
        tabId: activeTab.tabId,
        item: {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          imageUrl: product.img_url,
        },
        quantity,
      }),
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          placeholder="Seleccione la categoría"
          options={categoryOptions}
          selectedValue={categoryFilter}
          onSelect={setCategoryFilter}
        />
      </View>

      {!activeTab || activeTab.status !== "draft" ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Selecciona una mesa antes de agregar productos.
        </Text>
      ) : (
        <Text style={[styles.activeTableText, { color: colors.textSecondary }]}>
          Mesa activa: {activeTab.tableName}
        </Text>
      )}

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando catálogo...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={5}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              description={item.description ?? undefined}
              price={item.price}
              image={item.img_url ?? undefined}
              onPress={(quantity) => handleAddProduct(item, quantity)}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No se encontraron productos con esos filtros.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dropdownContainer: { paddingHorizontal: 16, paddingTop: 16 },
  activeTableText: {
    paddingHorizontal: 16,
    marginBottom: 6,
    marginTop: 4,
    fontSize: 14,
  },
  listContainer: { paddingVertical: 15 },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
    color: "#ef4444",
  },
});
