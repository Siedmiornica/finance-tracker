import { useState, useRef, useEffect } from 'react';
import type { TransactionInput, ValidationResult } from '../lib/types';

interface TransactionFormProps {
  onSubmit: (input: TransactionInput) => ValidationResult;
  filterCategories: (input: string) => string[];
  initialData?: TransactionInput;
  mode?: 'create' | 'edit';
}

const emptyForm: TransactionInput = {
  title: '',
  description: '',
  category: '',
  status: 'Kupiono',
  purchasePrice: 0,
  purchaseDate: '',
  salePrice: undefined,
  saleDate: undefined,
};

export function TransactionForm({
  onSubmit,
  filterCategories,
  initialData,
  mode = 'create',
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionInput>(initialData ?? emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === 'purchasePrice' || name === 'salePrice') {
      const numValue = value === '' ? undefined : parseFloat(value);
      setForm((prev) => ({ ...prev, [name]: numValue }));
    } else if (name === 'status') {
      setForm((prev) => ({
        ...prev,
        status: value as 'Kupiono' | 'Sprzedano',
        ...(value === 'Kupiono' ? { salePrice: undefined, saleDate: undefined } : {}),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, category: value }));

    if (value.length >= 1) {
      const filtered = filterCategories(value);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    if (errors.category) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setForm((prev) => ({ ...prev, category: suggestion }));
    setShowSuggestions(false);
    setSuggestions([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input: TransactionInput = {
      title: form.title,
      description: form.description || undefined,
      category: form.category || undefined,
      status: form.status,
      purchasePrice: form.purchasePrice,
      purchaseDate: form.purchaseDate,
      salePrice: form.status === 'Sprzedano' ? form.salePrice : undefined,
      saleDate: form.status === 'Sprzedano' ? form.saleDate : undefined,
    };

    const result = onSubmit(input);

    if (result.success) {
      setErrors({});
      if (mode === 'create') {
        setForm(emptyForm);
      }
    } else {
      setErrors(result.errors);
    }
  }

  const inputClasses = "mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 placeholder-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg" noValidate>
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300">
          Tytuł *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={100}
          className={inputClasses}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description ?? ''}
          onChange={handleChange}
          maxLength={500}
          rows={3}
          className={inputClasses}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description}</p>
        )}
      </div>

      {/* Category with autocomplete */}
      <div ref={categoryRef} className="relative">
        <label htmlFor="category" className="block text-sm font-medium text-gray-300">
          Kategoria
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={form.category ?? ''}
          onChange={handleCategoryChange}
          maxLength={50}
          autoComplete="off"
          className={inputClasses}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-40 overflow-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-600 text-sm text-gray-100"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        {errors.category && (
          <p className="mt-1 text-sm text-red-400">{errors.category}</p>
        )}
      </div>

      {/* Status - hidden in create mode, always Kupiono */}
      {mode === 'edit' && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="Kupiono">Kupiono</option>
            <option value="Sprzedano">Sprzedano</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-400">{errors.status}</p>
          )}
        </div>
      )}

      {/* Purchase Price */}
      <div>
        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300">
          Cena zakupu *
        </label>
        <input
          type="number"
          id="purchasePrice"
          name="purchasePrice"
          value={form.purchasePrice ?? ''}
          onChange={handleChange}
          min={0.01}
          max={999999999.99}
          step={0.01}
          className={inputClasses}
        />
        {errors.purchasePrice && (
          <p className="mt-1 text-sm text-red-400">{errors.purchasePrice}</p>
        )}
      </div>

      {/* Purchase Date */}
      <div>
        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300">
          Data zakupu *
        </label>
        <input
          type="date"
          id="purchaseDate"
          name="purchaseDate"
          value={form.purchaseDate}
          onChange={handleChange}
          className={inputClasses}
        />
        {errors.purchaseDate && (
          <p className="mt-1 text-sm text-red-400">{errors.purchaseDate}</p>
        )}
      </div>

      {/* Conditional fields for "Sprzedano" */}
      {form.status === 'Sprzedano' && (
        <>
          <div>
            <label htmlFor="salePrice" className="block text-sm font-medium text-gray-300">
              Cena sprzedaży *
            </label>
            <input
              type="number"
              id="salePrice"
              name="salePrice"
              value={form.salePrice ?? ''}
              onChange={handleChange}
              min={0.01}
              max={999999999.99}
              step={0.01}
              className={inputClasses}
            />
            {errors.salePrice && (
              <p className="mt-1 text-sm text-red-400">{errors.salePrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="saleDate" className="block text-sm font-medium text-gray-300">
              Data sprzedaży *
            </label>
            <input
              type="date"
              id="saleDate"
              name="saleDate"
              value={form.saleDate ?? ''}
              onChange={handleChange}
              className={inputClasses}
            />
            {errors.saleDate && (
              <p className="mt-1 text-sm text-red-400">{errors.saleDate}</p>
            )}
          </div>
        </>
      )}

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {mode === 'create' ? 'Dodaj transakcję' : 'Zapisz zmiany'}
        </button>
      </div>
    </form>
  );
}
