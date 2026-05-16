"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SummaryPanel from "@/components/SummaryPanel";
import type { Summary } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/summary");
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Panel zarządzania pozycjami
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Wyloguj się
        </button>
      </div>

      {/* Summary */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Podsumowanie
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Ładowanie...</p>
        ) : summary ? (
          <SummaryPanel summary={summary} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nie udało się załadować podsumowania.
          </p>
        )}
      </section>

      {/* Quick links */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Szybkie akcje
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/items"
            className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              📦 Pozycje
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Przeglądaj, edytuj i usuwaj pozycje
            </p>
          </Link>
          <Link
            href="/dashboard/items/new"
            className="rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:bg-green-50 dark:border-gray-700 dark:hover:border-green-600 dark:hover:bg-green-900/10"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              ➕ Dodaj pozycję
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Dodaj nową transakcję
            </p>
          </Link>
          <Link
            href="/dashboard/folders"
            className="rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/10"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              📁 Foldery
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Zarządzaj kategoriami
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
