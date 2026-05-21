export interface Transaction {
  id: string;
  number: number;
  title: string;
  description?: string;
  category?: string;
  status: 'Kupiono' | 'Sprzedano';
  purchasePrice: number;
  purchaseDate: string;
  salePrice?: number;
  saleDate?: string;
  profitPercent?: number;
  profitAmount?: number;
  daysHeld?: number;
}

export interface AboutData {
  description: string;
  socialLinks: { label: string; url: string }[];
}

export interface AppState {
  transactions: Transaction[];
  walletBalance: number;
  categories: string[];
  about: AboutData | null;
}

export interface DashboardStats {
  totalCount: number;
  avgProfitPercent: number;
  avgDays: number;
  bestTransaction: { title: string; profitPercent: number } | null;
  worstTransaction: { title: string; profitPercent: number } | null;
  totalProfitAmount: number;
  totalProfitPercent: number;
}

export interface HeatmapMonth {
  month: string;
  profitSum: number;
  transactionCount: number;
}

export interface TransactionInput {
  title: string;
  description?: string;
  category?: string;
  status: 'Kupiono' | 'Sprzedano';
  purchasePrice: number;
  purchaseDate: string;
  salePrice?: number;
  saleDate?: string;
}

export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}
