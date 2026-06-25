import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { navigationRef } from "./src/navigation/NavigationService";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { store } from "./src/store";
import { Provider } from "react-redux";

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
