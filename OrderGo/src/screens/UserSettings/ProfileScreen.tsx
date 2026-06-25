import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SectionTitle from "../../components/SectionTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const ROLE_LABELS = {
  waiter: "Mesero",
  kitchen: "Cocina",
  admin: "Administrador",
};

const getInitials = (name?: string, email?: string) => {
  const source = name?.trim() || email?.trim() || "Usuario";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <SectionTitle
          title="Perfil del usuario"
          subtitle="Información de la cuenta activa"
        />

        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {getInitials(user?.name, user?.email)}
            </Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name || "Usuario sin nombre"}
          </Text>

          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || "Correo no disponible"}
          </Text>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <MaterialCommunityIcons
              name="account-key-outline"
              size={18}
              color={colors.primary}
            />

            <Text style={[styles.roleText, { color: colors.primary }]}>
              {user?.role ? ROLE_LABELS[user.role] : "Rol no disponible"}
            </Text>
          </View>
        </View>

        <View
          style={[styles.infoCard, { backgroundColor: colors.inputBackground }]}
        >
          <InfoRow label="ID de usuario" value={user?.id ?? "No disponible"} />

          <InfoRow
            label="Rol del sistema"
            value={user?.role ? ROLE_LABELS[user.role] : "No disponible"}
          />

          <InfoRow label="Sesión" value={user?.token ? "Activa" : "Inactiva"} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.inputBorder }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>

      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    gap: 16,
  },
  profileCard: {
    alignItems: "center",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoRow: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
});
