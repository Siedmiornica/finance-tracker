// Item as stored in DB
export interface Item {
  id: number;
  description: string;
  purchasePrice: number; // stored as integer cents
  purchaseDate: string; // ISO date string YYYY-MM-DD
  salePrice: number | null; // stored as integer cents, null if active
  saleDate: string | null; // ISO date string, null if active
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Computed fields for display
export interface ItemWithProfit extends Item {
  status: "active" | "sold";
  profitAmount: number | null; // cents, null if active
  profitPercentage: number | null; // percentage, null if active or purchasePrice=0
}

// Folder
export interface Folder {
  id: number;
  name: string;
  createdAt: string;
}

// Summary
export interface Summary {
  totalProfit: number; // sum of all sold item profits (cents)
  totalActiveValue: number; // sum of all active item purchase prices (cents)
  soldCount: number;
  activeCount: number;
}

// Validation
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>; // field -> error message
}

// Item creation input
export interface CreateItemInput {
  description: string;
  purchasePrice: number; // user enters decimal, we convert to cents
  purchaseDate: string;
  folderId?: number | null;
}

// Item sale input
export interface SellItemInput {
  salePrice: number;
  saleDate: string;
}
