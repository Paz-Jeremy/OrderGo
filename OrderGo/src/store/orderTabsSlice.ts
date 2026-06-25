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
  | "delivered";

type RemoteOrderStatus = Exclude<OrderStatus, "draft">;

export type OrderItem = {
  orderItemId?: string;
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
  tableStatus: RestaurantTableStatus;
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

const getRemoteOrderStatus = (status: OrderStatus): RemoteOrderStatus =>
  status === "draft" ? "pending" : status;

const getTableStatusAfterSave = (tab: OrderTab): RestaurantTableStatus => {
  if (!tab.remoteOrderId) return "occupied";
  return tab.tableStatus;
};

const buildItemPayload = (orderId: string, item: OrderItem) => ({
  order_id: orderId,
  product_id: item.productId,
  quantity: item.quantity,
  notes: item.notes?.trim() ? item.notes.trim() : null,
  unit_price: item.unitPrice,
  line_total: item.unitPrice * item.quantity,
});

const normalizeRemoteItems = (items: any[]): OrderItem[] => {
  const itemsByProductId = new Map<string, OrderItem>();

  for (const item of items ?? []) {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    const productId = item.product_id;

    if (!productId) continue;

    const quantity = Number(item.quantity ?? 0);
    const notes = item.notes ?? "";

    const existing = itemsByProductId.get(productId);

    if (existing) {
      existing.quantity += quantity;

      if (notes && !existing.notes?.includes(notes)) {
        existing.notes = [existing.notes, notes].filter(Boolean).join(" | ");
      }

      continue;
    }

    itemsByProductId.set(productId, {
      orderItemId: item.id,
      productId,
      name: product?.name ?? "Producto sin nombre",
      unitPrice: Number(item.unit_price ?? product?.price ?? 0),
      quantity,
      notes,
      imageUrl: product?.img_url ?? null,
    });
  }

  return Array.from(itemsByProductId.values());
};

const updateExistingRemoteOrder = async (
  tab: OrderTab,
  status: RemoteOrderStatus,
  tableStatus: RestaurantTableStatus,
) => {
  if (!tab.remoteOrderId) {
    throw new Error("Este pedido todavía no existe en Supabase.");
  }

  const subtotal = getSubtotal(tab);
  const total = subtotal;

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", tab.remoteOrderId)
    .maybeSingle();

  if (existingOrderError) {
    throw new Error(existingOrderError.message);
  }

  if (!existingOrder) {
    throw new Error("No se encontró el pedido en Supabase.");
  }

  if (existingOrder.status === "delivered") {
    throw new Error("Este pedido ya está finalizado y no se puede modificar.");
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status,
      notes: tab.notes?.trim() ? tab.notes.trim() : null,
      customer_name: tab.customerName?.trim() ? tab.customerName.trim() : null,
      subtotal,
      total,
    })
    .eq("id", tab.remoteOrderId);

  if (orderError) {
    throw new Error(orderError.message);
  }

  const { data: currentItems, error: currentItemsError } = await supabase
    .from("order_items")
    .select("id, product_id")
    .eq("order_id", tab.remoteOrderId);

  if (currentItemsError) {
    throw new Error(currentItemsError.message);
  }

  const currentRows = currentItems ?? [];
  const usedItemIds = new Set<string>();

  for (const item of tab.items) {
    let rowToUpdate = currentRows.find(
      (row: any) =>
        row.id === item.orderItemId && !usedItemIds.has(String(row.id)),
    );

    if (!rowToUpdate) {
      rowToUpdate = currentRows.find(
        (row: any) =>
          row.product_id === item.productId && !usedItemIds.has(String(row.id)),
      );
    }

    if (rowToUpdate) {
      const rowId = String(rowToUpdate.id);

      const { error: updateItemError } = await supabase
        .from("order_items")
        .update({
          product_id: item.productId,
          quantity: item.quantity,
          notes: item.notes?.trim() ? item.notes.trim() : null,
          unit_price: item.unitPrice,
          line_total: item.unitPrice * item.quantity,
        })
        .eq("id", rowId);

      if (updateItemError) {
        throw new Error(updateItemError.message);
      }

      usedItemIds.add(rowId);
    } else {
      const { error: insertItemError } = await supabase
        .from("order_items")
        .insert(buildItemPayload(tab.remoteOrderId, item));

      if (insertItemError) {
        throw new Error(insertItemError.message);
      }
    }
  }

  const itemIdsToDelete = currentRows
    .map((row: any) => String(row.id))
    .filter((id) => !usedItemIds.has(id));

  if (itemIdsToDelete.length > 0) {
    const { error: deleteItemsError } = await supabase
      .from("order_items")
      .delete()
      .in("id", itemIdsToDelete);

    if (deleteItemsError) {
      throw new Error(deleteItemsError.message);
    }
  }

  const { error: tableError } = await supabase
    .from("tables")
    .update({ status: tableStatus })
    .eq("id", tab.tableId);

  if (tableError) {
    throw new Error(`No se pudo actualizar la mesa: ${tableError.message}`);
  }

  return {
    remoteOrderId: tab.remoteOrderId,
    status,
    tableStatus,
  };
};

export const loadOrderForEditing = createAsyncThunk<
  OrderTab,
  { orderId: string },
  { rejectValue: string }
>("orderTabs/loadOrderForEditing", async ({ orderId }, thunkApi) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        table_id,
        status,
        created_at,
        notes,
        customer_name,
        tables(id, table_number, status),
        order_items(
          id,
          product_id,
          quantity,
          notes,
          unit_price,
          line_total,
          products(id, name, price, img_url)
        )
      `,
    )
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return thunkApi.rejectWithValue(
      error?.message ?? "No se pudo cargar el pedido.",
    );
  }

  const orderData: any = data;

  if (orderData.status === "delivered") {
    return thunkApi.rejectWithValue(
      "Este pedido ya está finalizado y no se puede abrir.",
    );
  }

  const table = Array.isArray(orderData.tables)
    ? orderData.tables[0]
    : orderData.tables;

  if (!table) {
    return thunkApi.rejectWithValue("El pedido no tiene una mesa asociada.");
  }

  const timestamp = now();
  const tabId = `remote-${orderData.id}`;

  return {
    tabId,
    tableId: orderData.table_id,
    tableName: `Mesa ${Number(table.table_number)}`,
    tableNumber: Number(table.table_number),
    tableStatus: table.status as RestaurantTableStatus,
    customerName: orderData.customer_name ?? "",
    items: normalizeRemoteItems(orderData.order_items ?? []),
    notes: orderData.notes ?? "",
    status: orderData.status as RemoteOrderStatus,
    synced: true,
    remoteOrderId: orderData.id,
    createdAt: orderData.created_at ?? timestamp,
    updatedAt: timestamp,
  };
});

export const submitOrderTab = createAsyncThunk<
  {
    tabId: string;
    remoteOrderId: string;
    status: RemoteOrderStatus;
    tableStatus: RestaurantTableStatus;
  },
  { tabId: string },
  { state: RootState; rejectValue: string }
>("orderTabs/submitOrderTab", async ({ tabId }, thunkApi) => {
  const state = thunkApi.getState();
  const tab = state.orderTabs.tabsById[tabId];

  if (!tab) return thunkApi.rejectWithValue("La orden no existe.");

  if (tab.items.length === 0) {
    return thunkApi.rejectWithValue("Agrega al menos un producto al pedido.");
  }

  const status = getRemoteOrderStatus(tab.status);
  const tableStatus = getTableStatusAfterSave(tab);

  if (tab.remoteOrderId) {
    try {
      const result = await updateExistingRemoteOrder(tab, status, tableStatus);

      thunkApi.dispatch(
        setTableStatusLocal({
          tableId: tab.tableId,
          status: result.tableStatus,
        }),
      );

      return {
        tabId,
        remoteOrderId: result.remoteOrderId,
        status: result.status,
        tableStatus: result.tableStatus,
      };
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error?.message ?? "No se pudo actualizar el pedido.",
      );
    }
  }

  const subtotal = getSubtotal(tab);
  const total = subtotal;

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      table_id: tab.tableId,
      waiter_id: null,
      status,
      notes: tab.notes?.trim() ? tab.notes.trim() : null,
      customer_name: tab.customerName?.trim() ? tab.customerName.trim() : null,
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

  const itemsPayload = tab.items.map((item) =>
    buildItemPayload(orderData.id, item),
  );

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);

  if (itemsError) {
    return thunkApi.rejectWithValue(itemsError.message);
  }

  const { error: tableError } = await supabase
    .from("tables")
    .update({ status: tableStatus })
    .eq("id", tab.tableId);

  if (tableError) {
    return thunkApi.rejectWithValue(
      `No se pudo actualizar la mesa: ${tableError.message}`,
    );
  }

  thunkApi.dispatch(
    setTableStatusLocal({
      tableId: tab.tableId,
      status: tableStatus,
    }),
  );

  return { tabId, remoteOrderId: orderData.id, status, tableStatus };
});

export const finishOrderTab = createAsyncThunk<
  {
    tabId: string;
    remoteOrderId: string;
    status: RemoteOrderStatus;
    tableStatus: RestaurantTableStatus;
  },
  { tabId: string },
  { state: RootState; rejectValue: string }
>("orderTabs/finishOrderTab", async ({ tabId }, thunkApi) => {
  const state = thunkApi.getState();
  const tab = state.orderTabs.tabsById[tabId];

  if (!tab) return thunkApi.rejectWithValue("La orden no existe.");

  if (!tab.remoteOrderId) {
    return thunkApi.rejectWithValue(
      "Primero debes enviar o guardar el pedido antes de finalizarlo.",
    );
  }

  if (tab.items.length === 0) {
    return thunkApi.rejectWithValue("No puedes finalizar un pedido vacío.");
  }

  try {
    const result = await updateExistingRemoteOrder(
      tab,
      "delivered",
      "available",
    );

    thunkApi.dispatch(
      setTableStatusLocal({
        tableId: tab.tableId,
        status: "available",
      }),
    );

    return {
      tabId,
      remoteOrderId: result.remoteOrderId,
      status: "delivered",
      tableStatus: "available",
    };
  } catch (error: any) {
    return thunkApi.rejectWithValue(
      error?.message ?? "No se pudo finalizar el pedido.",
    );
  }
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
        tableStatus,
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

      if (tab.status === "delivered") return;

      tab.status = action.payload.status;
      tab.updatedAt = now();
    },

    setTabTableStatus: (
      state,
      action: PayloadAction<{
        tabId: string;
        tableStatus: RestaurantTableStatus;
      }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;

      if (tab.status === "delivered") return;

      tab.tableStatus = action.payload.tableStatus;
      tab.updatedAt = now();
    },

    addItemToTab: (
      state,
      action: PayloadAction<{
        tabId: string;
        item: Omit<OrderItem, "quantity" | "orderItemId">;
        quantity: number;
      }>,
    ) => {
      const tab = state.tabsById[action.payload.tabId];
      if (!tab) return;

      if (tab.status === "delivered") return;

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

      if (tab.status === "delivered") return;

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

      if (tab.status === "delivered") return;

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

      if (tab.status === "delivered") return;

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
      .addCase(loadOrderForEditing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrderForEditing.fulfilled, (state, action) => {
        const tab = action.payload;

        Object.keys(state.tabsById).forEach((tabId) => {
          if (state.tabsById[tabId].remoteOrderId === tab.remoteOrderId) {
            delete state.tabsById[tabId];
          }
        });

        state.loading = false;
        state.tabsById[tab.tabId] = tab;
        state.activeTabId = tab.tabId;
        state.activeTabIdByTableId[tab.tableId] = tab.tabId;
      })
      .addCase(loadOrderForEditing.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      })
      .addCase(submitOrderTab.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrderTab.fulfilled, (state, action) => {
        const tab = state.tabsById[action.payload.tabId];

        if (!tab) {
          state.loading = false;
          return;
        }

        state.loading = false;
        state.activeTabId = null;

        delete state.activeTabIdByTableId[tab.tableId];
        delete state.tabsById[action.payload.tabId];
      })
      .addCase(submitOrderTab.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      })
      .addCase(finishOrderTab.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finishOrderTab.fulfilled, (state, action) => {
        const tab = state.tabsById[action.payload.tabId];

        if (!tab) {
          state.loading = false;
          return;
        }

        state.loading = false;
        state.activeTabId = null;

        delete state.activeTabIdByTableId[tab.tableId];
        delete state.tabsById[action.payload.tabId];
      })
      .addCase(finishOrderTab.rejected, (state, action) => {
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
  setTabTableStatus,
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
