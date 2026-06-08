import { View, Text, StyleSheet, Switch, SafeAreaView } from "react-native";
import CustomButton from "../../components/CustomButton";
import { useTheme } from "../../contexts/ThemeContext";
import { navigationRef } from "../../navigation/NavigationService";
import SectionTitle from "../../components/SectionTitle";
import { useAuth } from "../../contexts/AuthContext";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { colors, theme, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    logout();
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <SectionTitle
          title="Configuraciones"
          subtitle="Personaliza tu experiencia en la app"
        />

        <View
          style={[styles.section, { backgroundColor: colors.inputBackground }]}
        >
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            Apariencia
          </Text>
          <Text style={[styles.currentValue, { color: colors.textSecondary }]}>
            Tema actual: {isDark ? "Oscuro" : "Claro"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={colors.onSecondary}
          />
        </View>

        <View
          style={[styles.section, { backgroundColor: colors.inputBackground }]}
        >
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            Sesión
          </Text>
          <CustomButton
            title="Cerrar sesión"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    marginTop: 15,
    paddingHorizontal: 24,
  },
  section: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "gray",
    padding: 14,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 13,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
});
