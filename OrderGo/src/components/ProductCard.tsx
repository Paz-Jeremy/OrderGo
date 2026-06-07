import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import CustomButton from "./CustomButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  name: string;
  description?: string;
  price: number;
  image?: string;
  onPress: (quantity: number) => void;
};

export default function ProductCard({
  name,
  description,
  price,
  image,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const [counter, setCounter] = useState(1);

  const handleIncrement = () => setCounter(counter + 1);
  const handleDecrement = () => setCounter(Math.max(1, counter - 1));

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {!image || image === "" ? (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.imagePlaceholder },
          ]}
        >
          <MaterialCommunityIcons
            name="food"
            size={80}
            color={colors.textSecondary}
          />
        </View>
      ) : (
        <Image
          source={{ uri: image }}
          style={[styles.image, { backgroundColor: colors.imagePlaceholder }]}
          resizeMode="cover"
        />
      )}

      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>

        {description ? (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            Lps. {price.toFixed(2)}
          </Text>

          {/* Contenedor del Contador */}
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[
                styles.counterButton,
                { backgroundColor: colors.counterBg },
              ]}
              onPress={handleDecrement}
              activeOpacity={0.7}
            >
              <Text style={[styles.counterButtonText, { color: colors.text }]}>
                -
              </Text>
            </TouchableOpacity>

            <Text style={[styles.counterText, { color: colors.text }]}>
              {counter}
            </Text>

            <TouchableOpacity
              style={[
                styles.counterButton,
                { backgroundColor: colors.counterBg },
              ]}
              onPress={handleIncrement}
              activeOpacity={0.7}
            >
              <Text style={[styles.counterButtonText, { color: colors.text }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addButtonContainer}>
          <CustomButton title="Agregar" onPress={() => onPress(counter)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 150,
  },
  iconContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "900",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: -2,
  },
  counterText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  addButtonContainer: {
    marginTop: 8,
  },
});
