import { useState } from 'react';
import type { Transaction, TransactionInput, ValidationResult } from '../lib/types';

interface TransactionListProps {
  transactions: Transaction[];
  isAdmin?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onMarkAsSold?: (id: string, input: TransactionInput) => ValidationResult;
}

function formatProfitPercent(value: number | undefined): string {
  if (value === undefined) return '—';
  return `${value.toFixed(2)}%`;
}

function formatProfitAmount(value: number | undefined): string {
  if (value === undefined) return '—';
  return value.toFixed(2);
}

function profitColorClass(value: number | undefined): string {
  if (value === undefined || value === 0) return 'text-gray-300';
  return value > 0 ? 'text-green-400' : 'text-red-400';
}

export function TransactionList({
  transactions,
  isAdmin = false,
  onEdit,
  onDelete,
  onMarkAsSold,
}: TransactionListProps) {
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [saleErrors, setSaleErrors] = useState<Record<string, string>>({});

  const displayTransactions = isAdmin
    ? transactions
    : transactions.filter((t) => t.status === 'Sprzedano');

  if (displayTransactions.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        Brak transakcji do wyświetlenia
      </p>
    );
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Czy na pewno chcesz usunąć tę transakcję?'
    );
    if (confirmed && onDelete) {
      onDelete(id);
    }
  }

  function handleStartSelling(transaction: Transaction) {
    setSellingId(transaction.id);
    setSalePrice('');
    setSaleDate('');
    setSaleErrors({});
  }

  function handleCancelSelling() {
    setSellingId(null);
    setSalePrice('');
    setSaleDate('');
    setSaleErrors({});
  }

  function handleConfirmSale(transaction: Transaction) {
    if (!onMarkAsSold) return;

    const input: TransactionInput = {
      title: transaction.title,
      description: transaction.description,
      category: transaction.category,
      status: 'Sprzedano',
      purchasePrice: transaction.purchasePrice,
      purchaseDate: transaction.purchaseDate,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      saleDate: saleDate || undefined,
    };

    const result = onMarkAsSold(transaction.id, input);

    if (result.success) {
      setSellingId(null);
      setSalePrice('');
      setSaleDate('');
      setSaleErrors({});
    } else {
      setSaleErrors(result.errors);
    }
  }

  if (isAdmin) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-400">Nr</th>
              <th className="px-3 py-2 text-left font-medium text-gray-400">Tytuł</th>
              <th className="px-3 py-2 text-left font-medium text-gray-400">Kategoria</th>
              <th className="px-3 py-2 text-left font-medium text-gray-400">Status</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400">Cena zakupu</th>
              <th className="px-3 py-2 text-left font-medium text-gray-400">Data zakupu</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400">Cena sprzedaży</th>
              <th className="px-3 py-2 text-left font-medium text-gray-400">Data sprzedaży</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400">Zysk %</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400">Zysk kwotowy</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400">Dni</th>
              <th className="px-3 py-2 text-center font-medium text-gray-400">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayTransactions.map((t) => (
              <>
                <tr key={t.id} className="hover:bg-gray-750 hover:bg-opacity-50">
                  <td className="px-3 py-2 text-gray-300">{t.number}</td>
                  <td className="px-3 py-2 font-medium text-gray-100">{t.title}</td>
                  <td className="px-3 py-2 text-gray-300">{t.category ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        t.status === 'Sprzedano'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-300">{t.purchasePrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-gray-300">{t.purchaseDate}</td>
                  <td className="px-3 py-2 text-right text-gray-300">
                    {t.salePrice !== undefined ? t.salePrice.toFixed(2) : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-300">{t.saleDate ?? '—'}</td>
                  <td className={`px-3 py-2 text-right ${profitColorClass(t.profitPercent)}`}>
                    {formatProfitPercent(t.profitPercent)}
                  </td>
                  <td className={`px-3 py-2 text-right ${profitColorClass(t.profitAmount)}`}>
                    {formatProfitAmount(t.profitAmount)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-300">{t.daysHeld ?? '—'}</td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => onEdit?.(t)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium mr-2"
                    >
                      Edytuj
                    </button>
                    {t.status === 'Kupiono' && onMarkAsSold && (
                      <button
                        onClick={() => handleStartSelling(t)}
                        className="text-green-400 hover:text-green-300 text-xs font-medium mr-2"
                      >
                        Sprzedaj
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
                {/* Inline sale form */}
                {sellingId === t.id && (
                  <tr key={`${t.id}-sale`} className="bg-gray-800">
                    <td colSpan={12} className="px-4 py-3">
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Cena sprzedaży *</label>
                          <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            min={0.01}
                            max={999999999.99}
                            step={0.01}
                            placeholder="0.00"
                            className="bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {saleErrors.salePrice && (
                            <p className="text-red-400 text-xs mt-1">{saleErrors.salePrice}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Data sprzedaży *</label>
                          <input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {saleErrors.saleDate && (
                            <p className="text-red-400 text-xs mt-1">{saleErrors.saleDate}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleConfirmSale(t)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Potwierdź sprzedaż
                        </button>
                        <button
                          onClick={handleCancelSelling}
                          className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded hover:bg-gray-500"
                        >
                          Anuluj
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Public mode — only completed transactions
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700 text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-400">Tytuł</th>
            <th className="px-3 py-2 text-left font-medium text-gray-400">Kategoria</th>
            <th className="px-3 py-2 text-right font-medium text-gray-400">Zysk %</th>
            <th className="px-3 py-2 text-right font-medium text-gray-400">Zysk kwotowy</th>
            <th className="px-3 py-2 text-right font-medium text-gray-400">Dni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {displayTransactions.map((t) => (
            <tr key={t.id} className="hover:bg-gray-800">
              <td className="px-3 py-2 font-medium text-gray-100">{t.title}</td>
              <td className="px-3 py-2 text-gray-300">{t.category ?? '—'}</td>
              <td className={`px-3 py-2 text-right ${profitColorClass(t.profitPercent)}`}>
                {formatProfitPercent(t.profitPercent)}
              </td>
              <td className={`px-3 py-2 text-right ${profitColorClass(t.profitAmount)}`}>
                {formatProfitAmount(t.profitAmount)}
              </td>
              <td className="px-3 py-2 text-right text-gray-300">{t.daysHeld ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
