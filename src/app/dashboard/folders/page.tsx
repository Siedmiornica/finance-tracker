"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ValidationErrors from "@/components/ValidationErrors";
import type { Folder } from "@/lib/types";

export default function DashboardFoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  async function fetchFolders() {
    try {
      const res = await fetch("/api/folders");
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setCreating(true);

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok || res.status === 201) {
        const folder = await res.json();
        setFolders((prev) => [...prev, folder].sort((a, b) =>
          a.name.localeCompare(b.name, "pl", { sensitivity: "base" })
        ));
        setName("");
        setMessage("Folder został utworzony.");
        setTimeout(() => setMessage(""), 3000);
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
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFolders((prev) => prev.filter((f) => f.id !== id));
        setDeleteConfirm(null);
        setMessage("Folder został usunięty.");
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
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Foldery
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Zarządzaj kategoriami pozycji
      </p>

      {message && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400" role="status">
          {message}
        </div>
      )}

      {/* Create folder form */}
      <form onSubmit={handleCreate} className="mt-6">
        <ValidationErrors errors={errors} />
        <div className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="folderName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nazwa nowego folderu
            </label>
            <input
              id="folderName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="np. Elektronika"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
          >
            {creating ? "Tworzenie..." : "Utwórz"}
          </button>
        </div>
      </form>

      {/* Folder list */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Istniejące foldery
        </h2>
        {folders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Brak folderów. Utwórz pierwszy folder powyżej.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {folders.map((folder) => (
              <li
                key={folder.id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  📁 {folder.name}
                </span>
                <div>
                  {deleteConfirm === folder.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(folder.id)}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Potwierdź
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        Anuluj
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(folder.id)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Usuń
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

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
