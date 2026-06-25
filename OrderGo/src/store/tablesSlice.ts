import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../services/supabaseClient";
import type { RootState } from "./index";

export type RestaurantTableStatus = "available" | "occupied";

export type RestaurantTable = {
  id: string;
  table_number: number;
  status: RestaurantTableStatus;
  created_at?: string | null;
};

type TablesState = {
  items: RestaurantTable[];
  loading: boolean;
  error: string | null;
  lastLoadedAt: string | null;
};

const initialState: TablesState = {
  items: [],
  loading: false,
  error: null,
  lastLoadedAt: null,
};

export const fetchTables = createAsyncThunk<
  RestaurantTable[],
  void,
  { rejectValue: string }
>("tables/fetchTables", async (_, thunkApi) => {
  const { data, error } = await supabase
    .from("tables")
    .select("id, table_number, status, created_at")
    .order("table_number", { ascending: true });

  if (error) {
    return thunkApi.rejectWithValue(error.message);
  }

  const mapped: RestaurantTable[] = (data ?? []).map((item: any) => ({
    id: item.id,
    table_number: Number(item.table_number),
    status: item.status as RestaurantTableStatus,
    created_at: item.created_at ?? null,
  }));

  return mapped;
});

const tablesSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    clearTablesError(state) {
      state.error = null;
    },
    setTableStatusLocal(
      state,
      action: PayloadAction<{
        tableId: string;
        status: RestaurantTableStatus;
      }>,
    ) {
      const table = state.items.find(
        (item) => item.id === action.payload.tableId,
      );
      if (!table) return;
      table.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastLoadedAt = new Date().toISOString();
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      });
  },
});

export const { clearTablesError, setTableStatusLocal } = tablesSlice.actions;
export default tablesSlice.reducer;

export const selectTables = (state: RootState) => state.tables.items;
export const selectTablesLoading = (state: RootState) => state.tables.loading;
export const selectTablesError = (state: RootState) => state.tables.error;
