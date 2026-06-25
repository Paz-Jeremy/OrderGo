import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../services/supabaseClient";
import type { RootState } from "./index";

export type Category = {
  id: string;
  name: string;
  created_at?: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  img_url: string | null;
  is_available: boolean;
  category_id: string | null;
};

type CatalogState = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  lastLoadedAt: string | null;
};

const initialState: CatalogState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  lastLoadedAt: null,
};

export const fetchCatalog = createAsyncThunk<
  { products: Product[]; categories: Category[] },
  void,
  { rejectValue: string }
>("catalog/fetchCatalog", async (_, thunkApi) => {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, description, price, img_url, is_available, category_id",
      )
      .order("created_at", { ascending: true }),

    supabase
      .from("categories")
      .select("id, name, created_at")
      .order("name", { ascending: true }),
  ]);

  if (productsRes.error) {
    return thunkApi.rejectWithValue(productsRes.error.message);
  }

  if (categoriesRes.error) {
    return thunkApi.rejectWithValue(categoriesRes.error.message);
  }

  const products: Product[] = (productsRes.data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    img_url: item.img_url,
    is_available: Boolean(item.is_available),
    category_id: item.category_id,
  }));

  const categories: Category[] = (categoriesRes.data ?? []).map(
    (item: any) => ({
      id: item.id,
      name: item.name,
      created_at: item.created_at ?? null,
    }),
  );

  return { products, categories };
});

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    clearCatalogError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.categories = action.payload.categories;
        state.lastLoadedAt = new Date().toISOString();
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      });
  },
});

export const { clearCatalogError } = catalogSlice.actions;
export default catalogSlice.reducer;

export const selectProducts = (state: RootState) => state.catalog.products;
export const selectCategories = (state: RootState) => state.catalog.categories;
export const selectCatalogLoading = (state: RootState) => state.catalog.loading;
export const selectCatalogError = (state: RootState) => state.catalog.error;
