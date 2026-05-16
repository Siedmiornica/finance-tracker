/**
 * Profit calculation logic.
 * All prices are in integer cents (1 = $0.01).
 */

export interface ProfitResult {
  amount: number; // profit in cents (can be negative for a loss)
  percentage: number | null; // percentage rounded to 2 decimal places, null if purchasePrice is 0
}

/**
 * Calculate profit amount and percentage from purchase and sale prices.
 * @param purchasePrice - purchase price in integer cents
 * @param salePrice - sale price in integer cents
 * @returns profit amount (cents) and percentage (or null if purchasePrice is 0)
 */
export function calculateProfit(
  purchasePrice: number,
  salePrice: number
): ProfitResult {
  const amount = salePrice - purchasePrice;
  const percentage =
    purchasePrice > 0
      ? Math.round(((salePrice - purchasePrice) / purchasePrice) * 10000) / 100
      : null;
  return { amount, percentage };
}
