import { getDb } from "@/lib/db";
import { deriveStatus } from "@/lib/status";
import { calculateProfit } from "@/lib/profit";
import { calculateSummary } from "@/lib/summary";
import type { Item, ItemWithProfit, Folder } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import SummaryPanel from "@/components/SummaryPanel";
import FolderList from "@/components/FolderList";

export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  const db = getDb();

  // Fetch items
  const itemRows = db
    .prepare("SELECT * FROM items ORDER BY created_at DESC")
    .all() as Array<{
    id: number;
    description: string;
    purchase_price: number;
    purchase_date: string;
    sale_price: number | null;
    sale_date: string | null;
    folder_id: number | null;
    created_at: string;
    updated_at: string;
  }>;

  const items: Item[] = itemRows.map((row) => ({
    id: row.id,
    description: row.description,
    purchasePrice: row.purchase_price,
    purchaseDate: row.purchase_date,
    salePrice: row.sale_price,
    saleDate: row.sale_date,
    folderId: row.folder_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const itemsWithProfit: ItemWithProfit[] = items.map((item) => {
    const status = deriveStatus(item);
    let profitAmount: number | null = null;
    let profitPercentage: number | null = null;

    if (status === "sold" && item.salePrice != null) {
      const profit = calculateProfit(item.purchasePrice, item.salePrice);
      profitAmount = profit.amount;
      profitPercentage = profit.percentage;
    }

    return { ...item, status, profitAmount, profitPercentage };
  });

  // Fetch folders
  const folderRows = db
    .prepare("SELECT * FROM folders ORDER BY name COLLATE NOCASE")
    .all() as Array<{
    id: number;
    name: string;
    created_at: string;
  }>;

  const folders: Folder[] = folderRows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }));

  // Calculate summary
  const summary = calculateSummary(items);

  // Group items by folder
  const folderMap = new Map(folders.map((f) => [f.id, f.name]));
  const groupedItems: Record<string, ItemWithProfit[]> = {};
  const ungroupedItems: ItemWithProfit[] = [];

  for (const item of itemsWithProfit) {
    if (item.folderId != null && folderMap.has(item.folderId)) {
      const folderName = folderMap.get(item.folderId)!;
      if (!groupedItems[folderName]) {
        groupedItems[folderName] = [];
      }
      groupedItems[folderName].push(item);
    } else {
      ungroupedItems.push(item);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Portfolio
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Publiczny widok transakcji finansowych
      </p>

      {/* Summary */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Podsumowanie
        </h2>
        <SummaryPanel summary={summary} />
      </section>

      {/* Folders */}
      {folders.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Foldery
          </h2>
          <FolderList folders={folders} />
        </section>
      )}

      {/* Items */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Pozycje
        </h2>

        {itemsWithProfit.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Brak pozycji.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Grouped by folder */}
            {Object.entries(groupedItems).map(([folderName, folderItems]) => (
              <div key={folderName}>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  📁 {folderName}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {folderItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}

            {/* Ungrouped items */}
            {ungroupedItems.length > 0 && (
              <div>
                {Object.keys(groupedItems).length > 0 && (
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bez folderu
                  </h3>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {ungroupedItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
