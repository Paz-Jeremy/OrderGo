import React, { useState } from "react";
import { StyleSheet, FlatList, SafeAreaView, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import ProductCard from "../components/ProductCard";
import CustomDropdown from "../components/CustomDropdown";

const PRODUCT_ITEMS = [
  {
    id: "1",
    name: "Baleada Especial",
    description: "Tortilla de harina con frijoles, queso, mantequilla y huevo.",
    price: 45,
    category: "food",
    image:
      "https://www.goya.com/wp-content/uploads/2023/10/honduran-baleadas.jpg",
    disponible: true,
  },
  {
    id: "2",
    name: "Pollo con Tajadas",
    description:
      "Pollo frito acompañado de tajadas de plátano verde y ensalada.",
    price: 120,
    category: "food",
    image:
      "https://tanbuenoquesenota.com/hn/wp-content/uploads/sites/4/2022/06/Pollo-Chuco-1920x1080-1-1568x882.jpg",
    disponible: true,
  },
  {
    id: "3",
    name: "Sopa de Caracol",
    description:
      "Tradicional sopa costeña preparada con caracol, coco y vegetales.",
    price: 150,
    category: "food",
    image:
      "https://www.recetashonduras.com/base/stock/Recipe/sopa-de-caracol/sopa-de-caracol_web.jpg.webp",
    disponible: true,
  },
  {
    id: "4",
    name: "Montuca",
    description: "Tamal de maíz relleno de carne y envuelto en hojas de maíz.",
    price: 35,
    category: "food",
    image: "https://buenprovecho.hn/wp-content/uploads/2019/08/3.jpg",
    disponible: true,
  },
  {
    id: "5",
    name: "Carne Asada",
    description:
      "Carne de res a la parrilla acompañada de chismol, frijoles y tortillas.",
    price: 140,
    category: "food",
    image:
      "https://www.recetashonduras.com/base/stock/Recipe/carne-asada/carne-asada_web.jpg.webp",
    disponible: true,
  },
  {
    id: "6",
    name: "Yuca con Chicharrón",
    description: "Yuca cocida servida con chicharrón y curtido de repollo.",
    price: 90,
    category: "food",
    image:
      "https://www.recetashonduras.com/base/stock/Recipe/yuca-con-chicharrones/yuca-con-chicharrones_web.jpg",
    disponible: true,
  },
  {
    id: "7",
    name: "Horchata Hondureña",
    description: "Bebida refrescante elaborada con arroz y especias.",
    price: 25,
    category: "drink",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA6nsgqV6faDFkZFfWGgqy9mEYo1G0KvtCUw&shttps://www.hondurastips.hn/wp-content/uploads/2015/04/horchata11.jpg",
    disponible: true,
  },
  {
    id: "8",
    name: "Coca-Cola",
    description: "Bebida refrescante y gaseosa.",
    price: 20,
    category: "drink",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUaNvgeQbrMhKlXAJLQPX97KeZXqccu17GaA&s",
    disponible: true,
  },
  {
    id: "9",
    name: "Café Hondureño",
    description: "Café premium producido en las montañas de Honduras.",
    price: 30,
    category: "drink",
    image:
      "https://www.revistaeyn.com/binrepository/600x400/0c0/0d0/none/26086/UECT/negocios-honduras_139807_10_EN473246_MG233799389.jpg",
    disponible: true,
  },
];

const STATUS_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Bebidas", value: "drink" },
  { label: "Comida", value: "food" },
];

export default function MenuScreen() {
  const { colors } = useTheme();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = PRODUCT_ITEMS.filter((item) => {
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesCategory;
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          placeholder={"Seleccione la categoría"}
          options={STATUS_OPTIONS}
          selectedValue={categoryFilter}
          onSelect={(value) => setCategoryFilter(value)}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={5}
        renderItem={({ item }) => (
          <ProductCard
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            onPress={(quantity) => {
              console.log(`Añadiendo ${quantity} de ${item.name}`);
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No se encontraron productos con esos filtros.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingVertical: 15,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
