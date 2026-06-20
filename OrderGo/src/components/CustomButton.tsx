import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemeColors } from "../utils/types/ThemeColors";
import { useTheme } from "../contexts/ThemeContext";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  loading?: boolean;
};

export default function CustomButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
}: CustomButtonProps) {
  const { colors } = useTheme();
  const styles = getStyles(variant, colors);

  return (
    <TouchableOpacity
      style={[styles.button, loading && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={styles.buttonText.color} />
      ) : (
        <Text style={styles.buttonText}> {title} </Text>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (
  variant: "primary" | "secondary" | "tertiary",
  colors: ThemeColors,
) =>
  StyleSheet.create({
    button: {
      borderRadius: 6,
      backgroundColor:
        variant === "primary"
          ? colors.buttonPrimaryBg
          : variant === "secondary"
            ? colors.buttonSecondaryBg
            : colors.buttonTertiaryBg,
      padding: 12,
      width: "auto",
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      color:
        variant === "primary"
          ? colors.buttonPrimaryText
          : variant === "secondary"
            ? colors.buttonSecondaryText
            : colors.buttonTertiaryText,
      textAlign: "center",
      fontWeight: "600",
    },
  });
