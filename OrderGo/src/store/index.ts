import { configureStore } from "@reduxjs/toolkit";
import orderTabsReducer from "./orderTabsSlice";
import catalogReducer from "./catalogSlice";
import tablesReducer from "./tablesSlice";

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    tables: tablesReducer,
    orderTabs: orderTabsReducer,
  },
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;