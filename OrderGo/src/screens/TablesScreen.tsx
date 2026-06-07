import React, { useState } from "react";
import { StyleSheet, FlatList, SafeAreaView, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import TableStatusCard from "../components/TableStatusCard";
import CustomInput from "../components/CustomInput";
import CustomDropdown from "../components/CustomDropdown";

const TABLE_ITEMS = [
  { id: "1", tableNumber: "1", status: "occupied" },
  { id: "2", tableNumber: "2", status: "available" },
  { id: "3", tableNumber: "3", status: "available" },
  { id: "4", tableNumber: "4", status: "occupied" },
  { id: "5", tableNumber: "5", status: "available" },
];

// 1. Definimos las opciones para tu Dropdown
const STATUS_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Disponibles", value: "available" },
  { label: "Ocupadas", value: "occupied" },
];

export default function TablesScreen() {
  const { colors } = useTheme();
  
  // Estado para el texto de búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  // 2. Estado para el filtro del Dropdown
  const [statusFilter, setStatusFilter] = useState("all");

  // 3. Lógica para filtrar por ambos criterios
  const filteredTables = TABLE_ITEMS.filter((item) => {
    // ¿El número de la mesa incluye lo que escribimos?
    const matchesSearch = item.tableNumber.includes(searchQuery);
    
    // ¿El estado coincide? (Si el filtro es 'all', mostramos todas)
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    // Solo mostramos la mesa si cumple AMBAS condiciones
    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* 4. Contenedor para alinear los filtros lado a lado */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterWrapper}>
          <CustomInput 
            type="number" 
            placeholder={"Nº de mesa"} 
            value={searchQuery} 
            onChange={(text) => setSearchQuery(text)} 
          />
        </View>

        <View style={styles.filterWrapper}>
          <CustomDropdown 
            placeholder={"Estado"} 
            options={STATUS_OPTIONS} 
            selectedValue={statusFilter} 
            onSelect={(value) => setStatusFilter(value)} // Actualiza el filtro
          />
        </View>
      </View>
      
      <FlatList
        data={filteredTables}
        keyExtractor={(item) => item.id}
        numColumns={1/2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TableStatusCard
            tableNumber={item.tableNumber}
            status={item.status}
            onPress={() => console.log(`Entrando a mesa #${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.inputText }]}>
            No se encontraron mesas con esos filtros.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
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
  }
});