import { Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// Agregamos usePreventRemove en la importación
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import TablesScreen from "../screens/TablesScreen";
import MenuScreen from "../screens/MenuScreen";
import OrderDetail from "../screens/OrderDetails";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectActiveTab } from "../store/orderTabsSelectors";
import { closeTab } from "../store/orderTabsSlice";

type TabsParamList = {
  Tables: undefined;
  Products: undefined;
  Details: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export type { TabsParamList };

export default function TabNavigator() {
  const { colors } = useTheme();

  // 1. Instanciamos el hook de navegación
  const navigation = useNavigation();

  // 2. Este es exclusivo para Redux
  const reduxDispatch = useAppDispatch();

  const activeTab = useAppSelector(selectActiveTab);
  const hasActiveTab = !!activeTab;

  usePreventRemove(hasActiveTab, (e) => {
    Alert.alert(
      "¿Salir sin guardar?",
      `Tienes la Mesa ${activeTab?.tableNumber} cargada. Si retrocedes ahora perderás el progreso de este pedido.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            if (activeTab) {
              // Usamos el dispatch de Redux para cerrar la mesa
              reduxDispatch(closeTab(activeTab.tabId));
            }
            // Usamos el dispatch de NAVIGATION para continuar el viaje a MainMenu
            navigation.dispatch(e.data.action);
          },
        },
      ],
    );
  });

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBackground,
        },
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
      }}
    >
      <Tab.Screen
        name="Tables"
        component={TablesScreen}
        options={{
          title: "Mesas",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="table-restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={MenuScreen}
        options={{
          title: "Productos",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Details"
        component={OrderDetail}
        options={{
          title: "Detalles",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
