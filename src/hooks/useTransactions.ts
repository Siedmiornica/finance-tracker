import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { calcProfit, calcDaysHeld } from '../lib/calculations';
import type { Transaction, TransactionInput, ValidationResult } from '../lib/types';

const TRANSACTIONS_KEY = 'transactions';
const WALLET_KEY = 'wallet';
const CATEGORIES_KEY = 'categories';
const MAX_CATEGORIES = 100;
const MAX_SUGGESTIONS = 5;

function validateInput(input: TransactionInput): ValidationResult {
  const errors: Record<string, string> = {};

  // Required fields
  if (!input.title || input.title.trim().length === 0) {
    errors.title = 'Tytuł jest wymagany';
  } else if (input.title.length > 100) {
    errors.title = 'Tytuł może mieć maksymalnie 100 znaków';
  }

  if (input.category !== undefined && input.category !== null && input.category.length > 50) {
    errors.category = 'Kategoria może mieć maksymalnie 50 znaków';
  }

  if (input.description !== undefined && input.description !== null && input.description.length > 500) {
    errors.description = 'Opis może mieć maksymalnie 500 znaków';
  }

  if (!input.status) {
    errors.status = 'Status jest wymagany';
  } else if (input.status !== 'Kupiono' && input.status !== 'Sprzedano') {
    errors.status = 'Status musi być "Kupiono" lub "Sprzedano"';
  }

  if (input.purchasePrice === undefined || input.purchasePrice === null) {
    errors.purchasePrice = 'Cena zakupu jest wymagana';
  } else if (input.purchasePrice < 0.01 || input.purchasePrice > 999999999.99) {
    errors.purchasePrice = 'Cena zakupu musi być od 0.01 do 999 999 999.99';
  }

  if (!input.purchaseDate) {
    errors.purchaseDate = 'Data zakupu jest wymagana';
  }

  // Sprzedano-specific validation
  if (input.status === 'Sprzedano') {
    if (input.salePrice === undefined || input.salePrice === null) {
      errors.salePrice = 'Cena sprzedaży jest wymagana dla statusu "Sprzedano"';
    } else if (input.salePrice < 0.01 || input.salePrice > 999999999.99) {
      errors.salePrice = 'Cena sprzedaży musi być od 0.01 do 999 999 999.99';
    }

    if (!input.saleDate) {
      errors.saleDate = 'Data sprzedaży jest wymagana dla statusu "Sprzedano"';
    } else if (input.purchaseDate && input.saleDate < input.purchaseDate) {
      errors.saleDate = 'Data sprzedaży nie może być wcześniejsza niż data zakupu';
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getNextNumber(transactions: Transaction[]): number {
  if (transactions.length === 0) return 1;
  const maxNumber = Math.max(...transactions.map((t) => t.number));
  return maxNumber + 1;
}

function buildTransaction(
  input: TransactionInput,
  id: string,
  number: number
): Transaction {
  const transaction: Transaction = {
    id,
    number,
    title: input.title.trim(),
    status: input.status,
    purchasePrice: input.purchasePrice,
    purchaseDate: input.purchaseDate,
  };

  if (input.description && input.description.trim().length > 0) {
    transaction.description = input.description.trim();
  }

  if (input.category && input.category.trim().length > 0) {
    transaction.category = input.category.trim();
  }

  if (input.status === 'Sprzedano' && input.salePrice != null && input.saleDate) {
    transaction.salePrice = input.salePrice;
    transaction.saleDate = input.saleDate;

    const profit = calcProfit(input.purchasePrice, input.salePrice);
    transaction.profitPercent = profit.percent;
    transaction.profitAmount = profit.amount;
    transaction.daysHeld = calcDaysHeld(input.purchaseDate, input.saleDate);
  }

  return transaction;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    storage.get<Transaction[]>(TRANSACTIONS_KEY, [])
  );
  const [walletBalance, setWalletBalance] = useState<number>(() =>
    storage.get<number>(WALLET_KEY, 0)
  );
  const [categories, setCategories] = useState<string[]>(() =>
    storage.get<string[]>(CATEGORIES_KEY, [])
  );

  useEffect(() => {
    storage.set(TRANSACTIONS_KEY, transactions);
  }, [transactions]);

  useEffect(() => {
    storage.set(WALLET_KEY, walletBalance);
  }, [walletBalance]);

  useEffect(() => {
    storage.set(CATEGORIES_KEY, categories);
  }, [categories]);

  const addCategory = useCallback((category: string) => {
    if (!category || category.trim().length === 0) return;
    const trimmed = category.trim();
    setCategories((prev) => {
      const exists = prev.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prev;
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, trimmed];
    });
  }, []);

  const filterCategories = useCallback(
    (input: string): string[] => {
      if (!input || input.length === 0) return [];
      const lower = input.toLowerCase();
      return categories
        .filter((c) => c.toLowerCase().includes(lower))
        .slice(0, MAX_SUGGESTIONS);
    },
    [categories]
  );

  const add = useCallback(
    (input: TransactionInput): ValidationResult => {
      const validation = validateInput(input);
      if (!validation.success) return validation;

      const id = generateId();
      const number = getNextNumber(transactions);
      const transaction = buildTransaction(input, id, number);

      setTransactions((prev) => [...prev, transaction]);

      // Add profit to wallet if transaction is sold
      if (transaction.status === 'Sprzedano' && transaction.profitAmount != null) {
        setWalletBalance((prev) =>
          Math.round((prev + transaction.profitAmount!) * 100) / 100
        );
      }

      if (transaction.category) {
        addCategory(transaction.category);
      }

      return { success: true, errors: {} };
    },
    [transactions, addCategory]
  );

  const update = useCallback(
    (id: string, input: TransactionInput): ValidationResult => {
      const validation = validateInput(input);
      if (!validation.success) return validation;

      setTransactions((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index === -1) return prev;

        const existing = prev[index];
        const updated = buildTransaction(input, existing.id, existing.number);

        // Recalculate wallet: subtract old profit, add new profit
        const oldProfit =
          existing.status === 'Sprzedano' && existing.profitAmount != null
            ? existing.profitAmount
            : 0;
        const newProfit =
          updated.status === 'Sprzedano' && updated.profitAmount != null
            ? updated.profitAmount
            : 0;

        if (oldProfit !== newProfit) {
          setWalletBalance((prevBalance) =>
            Math.round((prevBalance - oldProfit + newProfit) * 100) / 100
          );
        }

        const next = [...prev];
        next[index] = updated;
        return next;
      });

      const trimmedCategory = input.category?.trim();
      if (trimmedCategory && trimmedCategory.length > 0) {
        addCategory(trimmedCategory);
      }

      return { success: true, errors: {} };
    },
    [addCategory]
  );

  const remove = useCallback((id: string): void => {
    setTransactions((prev) => {
      const transaction = prev.find((t) => t.id === id);

      // Subtract profit from wallet if removed transaction was sold
      if (
        transaction &&
        transaction.status === 'Sprzedano' &&
        transaction.profitAmount != null
      ) {
        setWalletBalance((prevBalance) =>
          Math.round((prevBalance - transaction.profitAmount!) * 100) / 100
        );
      }

      return prev.filter((t) => t.id !== id);
    });
  }, []);

  return {
    transactions,
    walletBalance,
    categories,
    add,
    update,
    remove,
    filterCategories,
  };
}
