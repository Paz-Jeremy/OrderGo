import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type Option = {
  label: string;
  value: string;
};

type Props = {
  placeholder: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export default function CustomDropdown({
  placeholder,
  options,
  selectedValue,
  onSelect,
}: Props) {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  // Buscar la etiqueta (label) del valor seleccionado para mostrarla en el botón
  const selectedLabel = options.find(
    (opt) => opt.value === selectedValue,
  )?.label;

  return (
    <View style={styles.wrapper}>
      {/* Botón principal que simula el Input */}
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => setIsVisible(true)}
      >
        <Text
          style={[
            styles.selectedText,
            {
              color: selectedLabel ? colors.inputText : colors.inputPlaceholder,
            },
          ]}
        >
          {selectedLabel || placeholder}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={colors.inputPlaceholder}
        />
      </TouchableOpacity>

      {/* Modal que contiene la lista de opciones */}
      <Modal visible={isVisible} transparent animationType="fade">
        {/* Fondo oscuro semitransparente para cerrar al tocar fuera */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[
              styles.dropdownList,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.inputBorder },
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsVisible(false);
                  }}
                >
                  <Text style={{ color: colors.inputText, fontSize: 16 }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    width: "100%",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Fondo oscurecido
    paddingHorizontal: 24,
  },
  dropdownList: {
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 250, // Limita la altura si hay muchas opciones
    overflow: "hidden",
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
});
