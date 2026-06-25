import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import SettingsScreen from "../screens/UserSettings/SettingsScreen";
import ProfileScreen from "../screens/UserSettings/ProfileScreen";

export type UserSettingsTabsParamList = {
  Profile: undefined;
  SettingsOptions: undefined;
};

const Tab = createBottomTabNavigator<UserSettingsTabsParamList>();

export default function UserSettingsTabsNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBackground,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsOptions"
        component={SettingsScreen}
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
