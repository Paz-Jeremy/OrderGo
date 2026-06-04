import { ThemeProvider } from "./src/contexts/ThemeContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

export default function App() {
  return (
    <ThemeProvider>
      <LoginScreen></LoginScreen>
    </ThemeProvider>
  );
}