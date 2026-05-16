import type { CreateItemInput, SellItemInput, ValidationResult } from "./types";

/**
 * Validate input for creating a new item.
 * - description: 1-500 characters (trimmed)
 * - purchasePrice: decimal value between 0.01 and 9,999,999.99 (converted to cents: 1-999999999)
 * - purchaseDate: valid date, not in the future
 */
export function validateCreateItem(input: CreateItemInput): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate description
  const description = (input.description ?? "").toString().trim();
  if (description.length === 0) {
    errors.description = "Description is required";
  } else if (description.length > 500) {
    errors.description = "Description must be at most 500 characters";
  }

  // Validate purchasePrice (user enters decimal dollars, e.g. 10.50)
  if (input.purchasePrice == null || input.purchasePrice === undefined) {
    errors.purchasePrice = "Purchase price is required";
  } else {
    const price = Number(input.purchasePrice);
    if (isNaN(price)) {
      errors.purchasePrice = "Purchase price must be a number";
    } else if (price < 0.01) {
      errors.purchasePrice = "Purchase price must be at least 0.01";
    } else if (price > 9999999.99) {
      errors.purchasePrice = "Purchase price must be at most 9,999,999.99";
    }
  }

  // Validate purchaseDate
  if (!input.purchaseDate || input.purchaseDate.trim() === "") {
    errors.purchaseDate = "Purchase date is required";
  } else {
    const date = new Date(input.purchaseDate);
    if (isNaN(date.getTime())) {
      errors.purchaseDate = "Purchase date must be a valid date";
    } else {
      // Check if date is in the future (compare date-only, ignoring time)
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        errors.purchaseDate = "Purchase date cannot be in the future";
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate input for selling an item.
 * - salePrice: must be at least 0.01 (decimal dollars)
 * - saleDate: must be a valid date
 * - Both must be present together
 */
export function validateSellItem(input: Partial<SellItemInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const hasSalePrice = input.salePrice != null && input.salePrice !== undefined;
  const hasSaleDate = input.saleDate != null && input.saleDate !== undefined && input.saleDate.trim() !== "";

  // Both must be present together
  if (!hasSalePrice && !hasSaleDate) {
    errors.salePrice = "Sale price is required";
    errors.saleDate = "Sale date is required";
  } else if (!hasSalePrice) {
    errors.salePrice = "Sale price is required when sale date is provided";
  } else if (!hasSaleDate) {
    errors.saleDate = "Sale date is required when sale price is provided";
  }

  // Validate salePrice value if present
  if (hasSalePrice) {
    const price = Number(input.salePrice);
    if (isNaN(price)) {
      errors.salePrice = "Sale price must be a number";
    } else if (price < 0.01) {
      errors.salePrice = "Sale price must be at least 0.01";
    }
  }

  // Validate saleDate value if present
  if (hasSaleDate) {
    const date = new Date(input.saleDate!);
    if (isNaN(date.getTime())) {
      errors.saleDate = "Sale date must be a valid date";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a folder name.
 * - 1-50 characters (trimmed)
 */
export function validateFolderName(name: string): ValidationResult {
  const errors: Record<string, string> = {};

  const trimmed = (name ?? "").toString().trim();
  if (trimmed.length === 0) {
    errors.name = "Folder name is required";
  } else if (trimmed.length > 50) {
    errors.name = "Folder name must be at most 50 characters";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
