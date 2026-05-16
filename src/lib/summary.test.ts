import { describe, it, expect } from "vitest";
import { calculateSummary } from "./summary";
import type { Item } from "./types";

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 1,
    description: "Test item",
    purchasePrice: 1000,
    purchaseDate: "2024-01-01",
    salePrice: null,
    saleDate: null,
    folderId: null,
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
    ...overrides,
  };
}

describe("calculateSummary", () => {
  it("returns zeros for empty array", () => {
    const result = calculateSummary([]);
    expect(result.totalProfit).toBe(0);
    expect(result.totalActiveValue).toBe(0);
    expect(result.soldCount).toBe(0);
    expect(result.activeCount).toBe(0);
  });

  it("sums purchase prices for active items", () => {
    const items = [
      makeItem({ id: 1, purchasePrice: 1000 }),
      makeItem({ id: 2, purchasePrice: 2000 }),
    ];
    const result = calculateSummary(items);
    expect(result.totalActiveValue).toBe(3000);
    expect(result.totalProfit).toBe(0);
    expect(result.activeCount).toBe(2);
    expect(result.soldCount).toBe(0);
  });

  it("sums profits for sold items", () => {
    const items = [
      makeItem({ id: 1, purchasePrice: 1000, salePrice: 1500, saleDate: "2024-02-01" }),
      makeItem({ id: 2, purchasePrice: 2000, salePrice: 3000, saleDate: "2024-02-01" }),
    ];
    const result = calculateSummary(items);
    expect(result.totalProfit).toBe(1500); // 500 + 1000
    expect(result.totalActiveValue).toBe(0);
    expect(result.soldCount).toBe(2);
    expect(result.activeCount).toBe(0);
  });

  it("handles mix of active and sold items", () => {
    const items = [
      makeItem({ id: 1, purchasePrice: 1000 }), // active
      makeItem({ id: 2, purchasePrice: 2000, salePrice: 3000, saleDate: "2024-02-01" }), // sold, profit 1000
      makeItem({ id: 3, purchasePrice: 500 }), // active
    ];
    const result = calculateSummary(items);
    expect(result.totalProfit).toBe(1000);
    expect(result.totalActiveValue).toBe(1500);
    expect(result.soldCount).toBe(1);
    expect(result.activeCount).toBe(2);
  });

  it("handles sold items with loss (negative profit)", () => {
    const items = [
      makeItem({ id: 1, purchasePrice: 2000, salePrice: 1000, saleDate: "2024-02-01" }),
    ];
    const result = calculateSummary(items);
    expect(result.totalProfit).toBe(-1000);
    expect(result.soldCount).toBe(1);
  });
});
