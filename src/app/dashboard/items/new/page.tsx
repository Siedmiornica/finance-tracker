"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ValidationErrors from "@/components/ValidationErrors";
import type { Folder } from "@/lib/types";

export default function NewItemPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch("/api/folders");
        if (res.ok) {
          const data = await res.json();
          setFolders(data);
        }
      } catch {
        // ignore
      }
    }
    fetchFolders();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        description,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        purchaseDate,
      };

      if (folderId) {
        body.folderId = Number(folderId);
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("Pozycja została dodana pomyślnie.");
        setTimeout(() => {
          router.push("/dashboard/items");
        }, 1000);
      } else if (res.status === 401) {
        window.location.href = "/login";
      } else {
        const data = await res.json();
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch {
      setErrors({ form: "Wystąpił błąd. Spróbuj ponownie." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Dodaj pozycję
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Wypełnij formularz, aby dodać nową transakcję
      </p>

      {message && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400" role="status">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ValidationErrors errors={errors} />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Opis
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="purchasePrice"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Cena zakupu (PLN)
          </label>
          <input
            id="purchasePrice"
            type="number"
            step="0.01"
            min="0.01"
            max="9999999.99"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="purchaseDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data zakupu
          </label>
          <input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="folderId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Folder (opcjonalnie)
          </label>
          <select
            id="folderId"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">— Brak folderu —</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
          >
            {loading ? "Zapisywanie..." : "Dodaj pozycję"}
          </button>
          <Link
            href="/dashboard/items"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}
