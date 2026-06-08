import React from "react";
import { StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import CustomCard from "../components/CustomCard";

// Definimos los datos del menú basándonos en tu diseño
const MENU_ITEMS = [
  {
    id: "1",
    title: "Crear Pedido",
    subtitle: "",
    name: "OrderTabs",
    iconName: "plus",
    iconColor: "#22c55e",
    iconBackgroundColor: "#dcfce7",
  },
  {
    id: "2",
    title: "Pedidos",
    subtitle: "Pedidos actuales",
    name: "Orders",
    iconName: "cart-outline",
    iconColor: "#f59e0b",
    iconBackgroundColor: "#fef3c7",
  },
  {
    id: "3",
    title: "Ajustes",
    subtitle: "Personalización y ajustes",
    name: "Settings",
    iconName: "cog-outline",
    iconColor: "#6b7280",
    iconBackgroundColor: "#f3f4f6",
  },
];

export default function MainMenuScreen({ navigation }: any) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={MENU_ITEMS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <CustomCard
            title={item.title}
            subtitle={item.subtitle}
            iconName={item.iconName as any}
            iconColor={item.iconColor}
            iconBackgroundColor={item.iconBackgroundColor}
            onPress={() => {
              navigation.navigate(item.name);
            }}
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
    padding: 15,
  },
});
