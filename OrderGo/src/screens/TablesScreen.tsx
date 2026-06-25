import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import TableStatusCard from "../components/TableStatusCard";
import CustomInput from "../components/CustomInput";
import CustomDropdown from "../components/CustomDropdown";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { openTabForTable } from "../store/orderTabsSlice";
import {
  fetchTables,
  selectTables,
  selectTablesLoading,
  selectTablesError,
} from "../store/tablesSlice";
import { useNavigation } from "@react-navigation/native";

const STATUS_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Disponibles", value: "available" },
  { label: "Ocupadas", value: "occupied" },
];

export default function TablesScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const tables = useAppSelector(selectTables);
  const loading = useAppSelector(selectTablesLoading);
  const error = useAppSelector(selectTablesError);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const filteredTables = tables.filter((item) => {
    const matchesSearch = String(item.table_number).includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePressTable = (item: (typeof tables)[number]) => {
    if (item.status === "occupied") {
      Alert.alert(
        "Mesa ocupada",
        "Esta mesa ya tiene un pedido activo. No puedes crear otro pedido.",
      );
      return;
    }

    dispatch(
      openTabForTable({
        tableId: item.id,
        tableName: `Mesa ${item.table_number}`,
        tableNumber: item.table_number,
        tableStatus: item.status,
      }),
    );

    navigation.navigate("Products");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.filtersContainer}>
        <View style={styles.filterWrapper}>
          <CustomInput
            type="number"
            placeholder="Nº de mesa"
            value={searchQuery}
            onChange={(text) => setSearchQuery(text)}
          />
        </View>

        <View style={styles.filterWrapper}>
          <CustomDropdown
            placeholder="Estado"
            options={STATUS_OPTIONS}
            selectedValue={statusFilter}
            onSelect={(value) => setStatusFilter(value)}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" />
          <Text style={[styles.emptyText, { color: colors.inputText }]}>
            Cargando mesas...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTables}
          keyExtractor={(item) => item.id}
          numColumns={1/2}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TableStatusCard
              tableNumber={String(item.table_number)}
              status={item.status}
              onPress={() => handlePressTable(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.inputText }]}>
              No se encontraron mesas con esos filtros.
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
    padding: 15,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
    padding: 15,
  },
  filterWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 16,
    paddingHorizontal: 16,
  },
});
