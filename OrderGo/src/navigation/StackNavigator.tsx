import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import { useTheme } from "../contexts/ThemeContext";
import TabNavigator from "./TabsNavigator";
import RegisterScreen from "../screens/RegisterScreen";
import MainMenuScreen from "../screens/MainMenuScreen";
import SettingsScreen from "../screens/UserSettings/SettingsScreen";
import OrdersScreen from "../screens/OrdersScreen";

//1. declarar tipado para pantallas y sus parametros
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainMenu: undefined;
  OrderTabs: undefined;
  Settings: undefined;
  Orders: undefined;
};

//2. crear el stack navigator el cual va a manejar la navegacion
const Stack = createNativeStackNavigator<RootStackParamList>();

//3. utilizar el stack
export default function StackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Login"
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
        options={{ headerShown: false, gestureEnabled: false }}
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
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: true, title:"Pedidos" }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title:"Configuración" }}
      />
    </Stack.Navigator>
  );
}
