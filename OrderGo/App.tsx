import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { navigationRef } from "./src/navigation/NavigationService";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <StackNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
