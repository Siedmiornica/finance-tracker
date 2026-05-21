import type { Transaction, DashboardStats, HeatmapMonth } from './types';

/**
 * Calculate profit percent and amount from purchase and sale prices.
 * Percent formula: ((sale - purchase) / purchase) * 100, rounded to 2 decimal places.
 * Amount: sale - purchase.
 */
export function calcProfit(
  purchase: number,
  sale: number
): { percent: number; amount: number } {
  const amount = sale - purchase;
  const percent = ((sale - purchase) / purchase) * 100;
  return {
    percent: Math.round(percent * 100) / 100,
    amount: Math.round(amount * 100) / 100,
  };
}

/**
 * Calculate calendar day difference between purchase and sale dates.
 */
export function calcDaysHeld(purchaseDate: string, saleDate: string): number {
  const purchase = new Date(purchaseDate);
  const sale = new Date(saleDate);
  const diffMs = sale.getTime() - purchase.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate dashboard statistics from all transactions.
 * totalCount includes ALL transactions (completed and not).
 * Other stats are derived from completed transactions only (status === 'Sprzedano').
 */
export function calcStats(transactions: Transaction[]): DashboardStats {
  const totalCount = transactions.length;
  const completed = transactions.filter(
    (t) => t.status === 'Sprzedano' && t.salePrice != null && t.saleDate != null
  );

  if (completed.length === 0) {
    return {
      totalCount,
      avgProfitPercent: 0,
      avgDays: 0,
      bestTransaction: null,
      worstTransaction: null,
      totalProfitAmount: 0,
      totalProfitPercent: 0,
    };
  }

  // Calculate profits for each completed transaction
  const completedWithProfit = completed.map((t) => {
    const profit = calcProfit(t.purchasePrice, t.salePrice!);
    const days = calcDaysHeld(t.purchaseDate, t.saleDate!);
    return { ...t, profitPercent: profit.percent, profitAmount: profit.amount, daysHeld: days };
  });

  // Average profit percent
  const sumProfitPercent = completedWithProfit.reduce((sum, t) => sum + t.profitPercent, 0);
  const avgProfitPercent = Math.round((sumProfitPercent / completedWithProfit.length) * 100) / 100;

  // Average days held (rounded to whole days)
  const sumDays = completedWithProfit.reduce((sum, t) => sum + t.daysHeld, 0);
  const avgDays = Math.round(sumDays / completedWithProfit.length);

  // Best transaction: highest profit %, if tied → most recent saleDate
  const sorted = [...completedWithProfit].sort((a, b) => {
    if (b.profitPercent !== a.profitPercent) return b.profitPercent - a.profitPercent;
    return new Date(b.saleDate!).getTime() - new Date(a.saleDate!).getTime();
  });
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Total profit amount: sum of all profit amounts
  const totalProfitAmount = completedWithProfit.reduce((sum, t) => sum + t.profitAmount, 0);

  // Total profit percent: ((sum of sale prices - sum of purchase prices) / sum of purchase prices) * 100
  const sumSalePrices = completed.reduce((sum, t) => sum + t.salePrice!, 0);
  const sumPurchasePrices = completed.reduce((sum, t) => sum + t.purchasePrice, 0);
  const totalProfitPercent =
    sumPurchasePrices === 0
      ? 0
      : Math.round(((sumSalePrices - sumPurchasePrices) / sumPurchasePrices) * 100 * 100) / 100;

  return {
    totalCount,
    avgProfitPercent,
    avgDays,
    bestTransaction: { title: best.title, profitPercent: best.profitPercent },
    worstTransaction: { title: worst.title, profitPercent: worst.profitPercent },
    totalProfitAmount: Math.round(totalProfitAmount * 100) / 100,
    totalProfitPercent,
  };
}

/**
 * Group completed transactions by month of saleDate.
 * Returns HeatmapMonth[] with month string (YYYY-MM), profit sum, and transaction count.
 */
export function calcHeatmapData(transactions: Transaction[]): HeatmapMonth[] {
  const completed = transactions.filter(
    (t) => t.status === 'Sprzedano' && t.salePrice != null && t.saleDate != null
  );

  if (completed.length === 0) return [];

  // Group by month
  const monthMap = new Map<string, { profitSum: number; transactionCount: number }>();

  for (const t of completed) {
    const date = new Date(t.saleDate!);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const profit = calcProfit(t.purchasePrice, t.salePrice!);

    const existing = monthMap.get(month);
    if (existing) {
      existing.profitSum += profit.amount;
      existing.transactionCount += 1;
    } else {
      monthMap.set(month, { profitSum: profit.amount, transactionCount: 1 });
    }
  }

  // Sort by month chronologically
  const result: HeatmapMonth[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      profitSum: Math.round(data.profitSum * 100) / 100,
      transactionCount: data.transactionCount,
    }));

  return result;
}
