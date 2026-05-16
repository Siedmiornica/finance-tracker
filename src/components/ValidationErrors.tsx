"use client";

interface ValidationErrorsProps {
  errors: Record<string, string>;
}

export default function ValidationErrors({ errors }: ValidationErrorsProps) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20" role="alert">
      <ul className="list-disc pl-5 space-y-1">
        {entries.map(([field, message]) => (
          <li key={field} className="text-sm text-red-700 dark:text-red-400">
            <span className="font-medium">{field}:</span> {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
