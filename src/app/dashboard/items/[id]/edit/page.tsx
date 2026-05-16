"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ValidationErrors from "@/components/ValidationErrors";
import type { Folder, ItemWithProfit } from "@/lib/types";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [salePrice, setSalePrice] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [itemsRes, foldersRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/folders"),
        ]);

        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData);
        }

        if (itemsRes.ok) {
          const items: ItemWithProfit[] = await itemsRes.json();
          const item = items.find((i) => i.id === Number(id));
          if (item) {
            setDescription(item.description);
            setPurchasePrice((item.purchasePrice / 100).toString());
            setPurchaseDate(item.purchaseDate);
            setFolderId(item.folderId != null ? item.folderId.toString() : "");
            if (item.salePrice != null) {
              setSalePrice((item.salePrice / 100).toString());
            }
            if (item.saleDate != null) {
              setSaleDate(item.saleDate);
            }
          } else {
            setNotFound(true);
          }
        }
      } catch {
        // ignore
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [id]);

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
        folderId: folderId ? Number(folderId) : null,
        salePrice: salePrice ? Number(salePrice) : undefined,
        saleDate: saleDate || undefined,
      };

      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("Pozycja została zaktualizowana pomyślnie.");
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

  if (fetching) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ładowanie...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Nie znaleziono
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Pozycja o podanym ID nie istnieje.
        </p>
        <Link
          href="/dashboard/items"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Powrót do listy
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Edytuj pozycję
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Zmień dane pozycji lub dodaj informacje o sprzedaży
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

        {/* Sale fields */}
        <fieldset className="mt-6 rounded-md border border-gray-200 p-4 dark:border-gray-700">
          <legend className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Sprzedaż (opcjonalnie)
          </legend>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="salePrice"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cena sprzedaży (PLN)
              </label>
              <input
                id="salePrice"
                type="number"
                step="0.01"
                min="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="saleDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data sprzedaży
              </label>
              <input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {(salePrice || saleDate) && (
              <button
                type="button"
                onClick={() => {
                  setSalePrice("");
                  setSaleDate("");
                }}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Usuń dane sprzedaży
              </button>
            )}
          </div>
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
          >
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
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
