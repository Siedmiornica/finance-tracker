import type { Item, Summary } from "./types";
import { deriveStatus } from "./status";

/**
 * Calculate summary statistics for a collection of items.
 * - totalProfit: sum of (salePrice - purchasePrice) for all sold items
 * - totalActiveValue: sum of purchasePrice for all active items
 */
export function calculateSummary(items: Item[]): Summary {
  let totalProfit = 0;
  let totalActiveValue = 0;
  let soldCount = 0;
  let activeCount = 0;

  for (const item of items) {
    const status = deriveStatus(item);
    if (status === "sold") {
      totalProfit += (item.salePrice as number) - item.purchasePrice;
      soldCount++;
    } else {
      totalActiveValue += item.purchasePrice;
      activeCount++;
    }
  }

  return { totalProfit, totalActiveValue, soldCount, activeCount };
}
