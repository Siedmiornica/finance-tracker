"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ItemWithProfit } from "@/lib/types";

function formatPLN(cents: number): string {
  return (cents / 100).toFixed(2) + " PLN";
}

export default function DashboardItemsPage() {
  const [items, setItems] = useState<ItemWithProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setMessage("Pozycja została usunięta.");
        setDeleteConfirm(null);
        setTimeout(() => setMessage(""), 3000);
      } else if (res.status === 401) {
        window.location.href = "/login";
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Pozycje
        </h1>
        <Link
          href="/dashboard/items/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Dodaj pozycję
        </Link>
      </div>

      {message && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400" role="status">
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Brak pozycji. <Link href="/dashboard/items/new" className="text-blue-600 hover:underline">Dodaj pierwszą pozycję</Link>.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="pb-2 font-medium text-gray-700 dark:text-gray-300">Opis</th>
                <th className="pb-2 font-medium text-gray-700 dark:text-gray-300">Cena zakupu</th>
                <th className="pb-2 font-medium text-gray-700 dark:text-gray-300">Data zakupu</th>
                <th className="pb-2 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="pb-2 font-medium text-gray-700 dark:text-gray-300">Zysk</th>
                <th className="pb-2 font-medium text-gray-700 dark:text-gray-300">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-gray-900 dark:text-gray-100">
                    {item.description}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {formatPLN(item.purchasePrice)}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {item.purchaseDate}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "sold"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {item.status === "sold" ? "Sprzedane" : "Aktywne"}
                    </span>
                  </td>
                  <td className="py-3">
                    {item.profitAmount != null ? (
                      <span
                        className={`font-medium ${
                          item.profitAmount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPLN(item.profitAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/items/${item.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edytuj
                      </Link>
                      {deleteConfirm === item.id ? (
                        <span className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Potwierdź
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                          >
                            Anuluj
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Usuń
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Powrót do dashboard
        </Link>
      </div>
    </div>
  );
}
