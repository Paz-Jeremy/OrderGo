import React from "react";
import { StyleSheet, FlatList, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import CustomCard from "../components/CustomCard";

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  name: string;
  iconName: string;
  iconColor: string;
  iconBackgroundColor: string;
};

const CREATE_ORDER_ITEM: MenuItem = {
  id: "create-order",
  title: "Crear Pedido",
  subtitle: "Abrir una mesa disponible",
  name: "OrderTabs",
  iconName: "plus",
  iconColor: "#22c55e",
  iconBackgroundColor: "#dcfce7",
};

const WAITER_ORDERS_ITEM: MenuItem = {
  id: "waiter-orders",
  title: "Pedidos",
  subtitle: "Pedidos actuales",
  name: "Orders",
  iconName: "cart-outline",
  iconColor: "#f59e0b",
  iconBackgroundColor: "#fef3c7",
};

const KITCHEN_ORDERS_ITEM: MenuItem = {
  id: "kitchen-orders",
  title: "Pedidos Cocina",
  subtitle: "Ver y actualizar estados",
  name: "KitchenOrders",
  iconName: "chef-hat",
  iconColor: "#ef4444",
  iconBackgroundColor: "#fee2e2",
};

const SETTINGS_ITEM: MenuItem = {
  id: "settings",
  title: "Ajustes",
  subtitle: "Perfil y configuración",
  name: "Settings",
  iconName: "cog-outline",
  iconColor: "#6b7280",
  iconBackgroundColor: "#f3f4f6",
};

export default function MainMenuScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const menuItems: MenuItem[] =
    user?.role === "kitchen"
      ? [KITCHEN_ORDERS_ITEM, SETTINGS_ITEM]
      : user?.role === "admin"
        ? [
            CREATE_ORDER_ITEM,
            WAITER_ORDERS_ITEM,
            KITCHEN_ORDERS_ITEM,
            SETTINGS_ITEM,
          ]
        : [CREATE_ORDER_ITEM, WAITER_ORDERS_ITEM, SETTINGS_ITEM];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <FlatList
        data={menuItems}
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
            onPress={() => navigation.navigate(item.name)}
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