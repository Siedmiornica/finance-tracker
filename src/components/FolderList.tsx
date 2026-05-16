import type { Folder } from "@/lib/types";

interface FolderListProps {
  folders: Folder[];
}

export default function FolderList({ folders }: FolderListProps) {
  if (folders.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Brak folderów.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {folders.map((folder) => (
        <span
          key={folder.id}
          className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {folder.name}
        </span>
      ))}
    </div>
  );
}
