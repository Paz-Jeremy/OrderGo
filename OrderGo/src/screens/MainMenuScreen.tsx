import React from "react";
import { StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import CustomCard from "../components/CustomCard";

// Definimos los datos del menú basándonos en tu diseño
const MENU_ITEMS = [
  {
    id: "1",
    title: "Mesas",
    subtitle: "Gestionar mesas del restaurante",
    iconName: "table-furniture",
    iconColor: "#3b82f6",
    iconBackgroundColor: "#dbeafe",
  },
  {
    id: "2",
    title: "Menú",
    subtitle: "Ver y gestionar platillos",
    iconName: "silverware-fork-knife",
    iconColor: "#22c55e",
    iconBackgroundColor: "#dcfce7",
  },
  {
    id: "3",
    title: "Pedidos",
    subtitle: "Pedidos actuales",
    iconName: "cart-outline",
    iconColor: "#f59e0b",
    iconBackgroundColor: "#fef3c7",
  },
  {
    id: "4",
    title: "Platillos",
    subtitle: "Gestionar platillos",
    iconName: "food-drumstick",
    iconColor: "#a855f7",
    iconBackgroundColor: "#f3e8ff",
  },
  {
    id: "5",
    title: "Ajustes",
    subtitle: "Personalización y ajustes",
    iconName: "cog-outline",
    iconColor: "#6b7280",
    iconBackgroundColor: "#f3f4f6",
  },
];

export default function MainMenuScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={MENU_ITEMS}
        keyExtractor={(item) => item.id}
        numColumns={2} // <--- Esto crea la magia de la cuadrícula
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <CustomCard
            title={item.title}
            subtitle={item.subtitle}
            iconName={item.iconName as any}
            iconColor={item.iconColor}
            iconBackgroundColor={item.iconBackgroundColor}
            onPress={() => console.log(`Navegando a ${item.title}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 15, // Espacio alrededor de toda la cuadrícula
  },
});
