import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function Nav() {
  const session = await getSession();

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Finance Tracker
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Portfolio
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Zaloguj się
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
