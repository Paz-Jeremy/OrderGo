import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "./src/components/CustomButton";
import { ThemeProvider } from "./src/context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text>Hola</Text>
        <StatusBar style="auto" />
        <CustomButton
          variant="primary"
          title={"Primario"}
          onPress={() => {}}
        ></CustomButton>
        <CustomButton
          variant="secondary"
          title={"Secundario"}
          onPress={() => {}}
        ></CustomButton>
        <CustomButton
          variant="tertiary"
          title={"Terciario"}
          onPress={() => {}}
        ></CustomButton>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
