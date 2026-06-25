import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export const selectCategoryOptions = createSelector(
  [(state: RootState) => state.catalog.categories],
  (categories) => [
    { label: "Todas", value: "all" },
    ...categories.map((category) => ({
      label:
        category.name === "food"
          ? "Comida"
          : category.name === "drink"
            ? "Bebidas"
            : category.name,
      value: category.id,
    })),
  ],
);
