import {
  createAsyncThunk,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { supabase } from "../services/supabaseClient";
import { setTableStatusLocal } from "./tablesSlice";
import type { RestaurantTableStatus } from "./tablesSlice";

export type OrderStatus =
  | "draft"
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  imageUrl?: string | null;
};

export type OrderTab = {
  tabId: string;
  tableId: string;
  tableName: string;
  tableNumber: number;
  customerName: string;
  items: OrderItem[];
  notes: string;
  status: OrderStatus;
  synced: boolean;
  remoteOrderId?: string;
  createdAt: string;
  updatedAt: string;
};

type OrderTabsState = {
  activeTabId: string | null;
  activeTabIdByTableId: Record<string, string>;
  tabsById: Record<string, OrderTab>;
  loading: boolean;
  error: string | null;
};

const initialState: OrderTabsState = {
  activeTabId: null,
  activeTabIdByTableId: {},
  tabsById: {},
  loading: false,
  error: null,
};

const now = () => new Date().toISOString();

const getSubtotal = (tab: OrderTab) =>
  tab.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

export const submitOrderTab = createAsyncThunk<
  { tabId: string; remoteOrderId: string },
  { tabId: string },
  { state: RootState; rejectValue: string }
>("orderTabs/submitOrderTab", async ({ tabId }, thunkApi) => {
  const state = thunkApi.getState();
  const tab = state.orderTabs.tabsById[tabId];

  if (!tab) return thunkApi.rejectWithValue("La orden no existe.");

  const subtotal = getSubtotal(tab);
  const total = subtotal;

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      table_id: tab.tableId,
      waiter_id: null,
      status: tab.status === "draft" ? "pending" : tab.status,
      notes: tab.notes,
      customer_name: tab.customerName || null,
      subtotal,
      total,
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    return thunkApi.rejectWithValue(
      orderError?.message ?? "No se pudo crear la orden.",
    );
  }

  const itemsPayload = tab.items.map((item) => ({
    order_id: orderData.id,
    product_id: item.productId,
    quantity: item.quantity,
    notes: item.notes ?? null,
    unit_price: item.unitPrice,
    line_total: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);

  if (itemsError) {
    return thunkApi.rejectWithValue(itemsError.message);
  }

  const { error: tableError } = await supabase
    .from("tables")
    .update({
      status: "occupied",
    })
    .eq("id", tab.tableId);

  if (tableError) {
    return thunkApi.rejectWithValue(
      `No se pudo actualizar la mesa: ${tableError.message}`,
    );
  }

  thunkApi.dispatch(
    setTableStatusLocal({
      tableId: tab.tableId,
      status: "occupied",
    }),
  );

  return { tabId, remoteOrderId: orderData.id };
});

const orderTabsSlice = createSlice({
  name: "orderTabs",
  initialState,
  reducers: {
    openTabForTable: (
      state,
      action: PayloadAction<{
        tableId: string;
        tableName: string;
        tableNumber: number;
        tableStatus: RestaurantTableStatus;
      }>,
    ) => {
      const { tableId, tableName, tableNumber, tableStatus } = action.payload;

      if (tableStatus === "occupied") {
        return;
      }

      const existingTabId = state.activeTabIdByTableId[tableId];

      if (existingTabId && state.tabsById[existingTabId]) {
        state.activeTabId = existingTabId;
        return;
      }

      const tabId = nanoid();
      const timestamp = now();

      state.tabsById[tabId] = {
        tabId,
        tableId,
        tableName,
        tableNumber,
        customerName: "",
        items: [],
        notes: "",
        status: "draft",
        synced: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      state.activeTabId = tabId;
      state.activeTabIdByTableId[tableId] = tabId;
    },

    setActiveTab: (state, action: PayloadAction<string | null>) => {
      state.activeTabId = action.payload;
    },

    setTabCustomerName: (
      state,
      action: PayloadAction<{ tabId: string; customerName: string }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;
      tab.customerName = action.payload.customerName;
      tab.updatedAt = now();
    },

    setTabNotes: (
      state,
      action: PayloadAction<{ tabId: string; notes: string }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;
      tab.notes = action.payload.notes;
      tab.updatedAt = now();
    },

    setTabStatus: (
      state,
      action: PayloadAction<{ tabId: string; status: OrderStatus }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;
      tab.status = action.payload.status;
      tab.updatedAt = now();
    },

    addItemToTab: (
      state,
      action: PayloadAction<{
        tabId: string;
        item: Omit<OrderItem, "quantity">;
        quantity: number;
      }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;

      const existing = tab.items.find(
        (i) => i.productId === action.payload.item.productId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        tab.items.push({
          ...action.payload.item,
          quantity: action.payload.quantity,
        });
      }

      tab.updatedAt = now();
    },

    updateItemQuantity: (
      state,
      action: PayloadAction<{
        tabId: string;
        productId: string;
        quantity: number;
      }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;

      const item = tab.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (!item) return;

      item.quantity = Math.max(1, action.payload.quantity);
      tab.updatedAt = now();
    },

    updateItemNotes: (
      state,
      action: PayloadAction<{
        tabId: string;
        productId: string;
        notes: string;
      }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;

      const item = tab.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (!item) return;

      item.notes = action.payload.notes;
      tab.updatedAt = now();
    },

    removeItemFromTab: (
      state,
      action: PayloadAction<{ tabId: string; productId: string }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;

      tab.items = tab.items.filter(
        (i) => i.productId !== action.payload.productId,
      );
      tab.updatedAt = now();
    },

    closeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      const tab = state.tabsById[tabId];
      if (!tab) return;

      delete state.tabsById[tabId];

      if (state.activeTabId === tabId) {
        state.activeTabId = null;
      }

      if (state.activeTabIdByTableId[tab.tableId] === tabId) {
        delete state.activeTabIdByTableId[tab.tableId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrderTab.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrderTab.fulfilled, (state, action) => {
        const tab = state.tabsById[action.payload.tabId];
        if (!tab) return;

        tab.synced = true;
        tab.remoteOrderId = action.payload.remoteOrderId;
        tab.status = "pending";
        tab.updatedAt = now();

        state.loading = false;
        state.activeTabId = null;
        delete state.activeTabIdByTableId[tab.tableId];
      })
      .addCase(submitOrderTab.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      });
  },
});

export const {
  openTabForTable,
  setActiveTab,
  setTabCustomerName,
  setTabNotes,
  setTabStatus,
  addItemToTab,
  updateItemQuantity,
  updateItemNotes,
  removeItemFromTab,
  closeTab,
} = orderTabsSlice.actions;

export default orderTabsSlice.reducer;

export const selectOrderTabsState = (state: RootState) => state.orderTabs;
export const selectTabsById = (state: RootState) => state.orderTabs.tabsById;
export const selectActiveTabId = (state: RootState) =>
  state.orderTabs.activeTabId;
