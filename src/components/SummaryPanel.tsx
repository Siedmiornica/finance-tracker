import type { Summary } from "@/lib/types";

function formatPLN(cents: number): string {
  return (cents / 100).toFixed(2) + " PLN";
}

interface SummaryPanelProps {
  summary: Summary;
}

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Łączny zysk</p>
        <p
          className={`text-lg font-semibold ${
            summary.totalProfit >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatPLN(summary.totalProfit)}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Wartość aktywnych
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatPLN(summary.totalActiveValue)}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Sprzedane</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {summary.soldCount}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Aktywne</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {summary.activeCount}
        </p>
      </div>
    </div>
  );
}
