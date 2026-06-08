import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import TablesScreen from "../screens/TablesScreen";
import MenuScreen from "../screens/MenuScreen";

//1. declarar tipado para pantallas y sus parametros
type TabsParamList = {
  Tables: undefined;
  Products: undefined;
};

//2. crear el tabs navigator el cual se va a manejar la navegacion por pestañas
const Tab = createBottomTabNavigator<TabsParamList>();

//3. utilizar el tab navigator
export type { TabsParamList };

export default function TabNavigator() {
  const { colors } = useTheme();
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
          headerShown: true,
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
