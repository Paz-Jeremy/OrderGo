import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NavigatorScreenParams } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import { useTheme } from "../contexts/ThemeContext";
import TabNavigator from "./TabsNavigator";
import type { TabsParamList } from "./TabsNavigator";
import RegisterScreen from "../screens/RegisterScreen";
import MainMenuScreen from "../screens/MainMenuScreen";
import SettingsScreen from "../screens/UserSettings/SettingsScreen";
import OrdersScreen from "../screens/OrdersScreen";
import { useAuth } from "../contexts/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainMenu: undefined;
  OrderTabs: NavigatorScreenParams<TabsParamList> | undefined;
  Settings: undefined;
  Orders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={user?.token != null ? "MainMenu" : "Login"}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="MainMenu"
        component={MainMenuScreen}
        options={{
          title: "Menú Principal",
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="OrderTabs"
        component={TabNavigator}
        options={{
          title: "Orden",
          headerShown: true,
          gestureEnabled: true,
        }}
      />

      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: true, title: "Pedidos" }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title: "Configuración" }}
      />
    </Stack.Navigator>
  );
}