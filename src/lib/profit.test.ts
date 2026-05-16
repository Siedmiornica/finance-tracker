import { describe, it, expect } from "vitest";
import { calculateProfit } from "./profit";

describe("calculateProfit", () => {
  it("calculates positive profit correctly", () => {
    // Bought for $10.00 (1000 cents), sold for $15.00 (1500 cents)
    const result = calculateProfit(1000, 1500);
    expect(result.amount).toBe(500);
    expect(result.percentage).toBe(50);
  });

  it("calculates negative profit (loss) correctly", () => {
    // Bought for $20.00 (2000 cents), sold for $15.00 (1500 cents)
    const result = calculateProfit(2000, 1500);
    expect(result.amount).toBe(-500);
    expect(result.percentage).toBe(-25);
  });

  it("calculates zero profit correctly", () => {
    const result = calculateProfit(1000, 1000);
    expect(result.amount).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("returns null percentage when purchasePrice is 0", () => {
    const result = calculateProfit(0, 1500);
    expect(result.amount).toBe(1500);
    expect(result.percentage).toBeNull();
  });

  it("rounds percentage to 2 decimal places", () => {
    // Bought for $3.00 (300 cents), sold for $4.00 (400 cents)
    // Percentage = (100/300)*100 = 33.333... → 33.33
    const result = calculateProfit(300, 400);
    expect(result.amount).toBe(100);
    expect(result.percentage).toBe(33.33);
  });

  it("handles large values correctly", () => {
    // Max purchase price: 999999999 cents ($9,999,999.99)
    const result = calculateProfit(999999999, 999999999);
    expect(result.amount).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("handles minimum values correctly", () => {
    // 1 cent purchase, 2 cents sale
    const result = calculateProfit(1, 2);
    expect(result.amount).toBe(1);
    expect(result.percentage).toBe(100);
  });
});
