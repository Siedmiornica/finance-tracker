import type { ItemWithProfit } from "@/lib/types";

function formatPLN(cents: number): string {
  return (cents / 100).toFixed(2) + " PLN";
}

function formatDate(dateStr: string): string {
  return dateStr; // Already in YYYY-MM-DD format
}

interface ItemCardProps {
  item: ItemWithProfit;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          {item.description}
        </h3>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === "sold"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          {item.status === "sold" ? "Sprzedane" : "Aktywne"}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Cena zakupu: <span className="font-medium">{formatPLN(item.purchasePrice)}</span>
        </p>
        <p>Data zakupu: {formatDate(item.purchaseDate)}</p>

        {item.status === "sold" && item.salePrice != null && (
          <>
            <p>
              Cena sprzedaży:{" "}
              <span className="font-medium">{formatPLN(item.salePrice)}</span>
            </p>
            {item.saleDate && <p>Data sprzedaży: {formatDate(item.saleDate)}</p>}
            <p
              className={`font-medium ${
                item.profitAmount != null && item.profitAmount >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              Zysk: {item.profitAmount != null ? formatPLN(item.profitAmount) : "—"}
              {item.profitPercentage != null && (
                <span className="ml-1">({item.profitPercentage.toFixed(2)}%)</span>
              )}
              {item.profitPercentage === null && item.profitAmount != null && (
                <span className="ml-1">(N/A)</span>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
