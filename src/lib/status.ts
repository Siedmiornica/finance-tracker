import type { Item } from "./types";

/**
 * Derive the status of an item based on its sale fields.
 * "sold" if both salePrice AND saleDate are non-null, otherwise "active".
 */
export function deriveStatus(item: Pick<Item, "salePrice" | "saleDate">): "active" | "sold" {
  if (item.salePrice != null && item.saleDate != null) {
    return "sold";
  }
  return "active";
}
