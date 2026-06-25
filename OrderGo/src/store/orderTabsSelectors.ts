import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { selectActiveTabId, selectTabsById } from "./orderTabsSlice";

const emptyItems: never[] = [];

export const selectActiveTab = createSelector(
  [selectActiveTabId, selectTabsById],
  (activeTabId, tabsById) =>
    activeTabId ? (tabsById[activeTabId] ?? null) : null,
);

export const selectActiveTabItems = createSelector(
  [selectActiveTab],
  (tab) => tab?.items ?? emptyItems,
);

export const selectActiveTabTotals = createSelector(
  [selectActiveTab],
  (tab) => {
    if (!tab) {
      return { subtotal: 0, total: 0 };
    }

    const subtotal = tab.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    return { subtotal, total: subtotal };
  },
);

export const selectTabsForTable = (tableId: string) =>
  createSelector([(state: RootState) => state.orderTabs.tabsById], (tabsById) =>
    Object.values(tabsById).filter((tab) => tab.tableId === tableId),
  );
