import { describe, it, expect } from "vitest";
import { validateCreateItem, validateSellItem, validateFolderName } from "./validation";

describe("validateCreateItem", () => {
  const validInput = {
    description: "Test item",
    purchasePrice: 10.0,
    purchaseDate: "2024-01-15",
  };

  it("accepts valid input", () => {
    const result = validateCreateItem(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rejects empty description", () => {
    const result = validateCreateItem({ ...validInput, description: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeDefined();
  });

  it("rejects whitespace-only description", () => {
    const result = validateCreateItem({ ...validInput, description: "   " });
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeDefined();
  });

  it("rejects description over 500 characters", () => {
    const result = validateCreateItem({ ...validInput, description: "a".repeat(501) });
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeDefined();
  });

  it("accepts description of exactly 500 characters", () => {
    const result = validateCreateItem({ ...validInput, description: "a".repeat(500) });
    expect(result.valid).toBe(true);
  });

  it("rejects purchasePrice below 0.01", () => {
    const result = validateCreateItem({ ...validInput, purchasePrice: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.purchasePrice).toBeDefined();
  });

  it("rejects purchasePrice above 9999999.99", () => {
    const result = validateCreateItem({ ...validInput, purchasePrice: 10000000 });
    expect(result.valid).toBe(false);
    expect(result.errors.purchasePrice).toBeDefined();
  });

  it("accepts minimum purchasePrice of 0.01", () => {
    const result = validateCreateItem({ ...validInput, purchasePrice: 0.01 });
    expect(result.valid).toBe(true);
  });

  it("accepts maximum purchasePrice of 9999999.99", () => {
    const result = validateCreateItem({ ...validInput, purchasePrice: 9999999.99 });
    expect(result.valid).toBe(true);
  });

  it("rejects future purchaseDate", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = validateCreateItem({
      ...validInput,
      purchaseDate: futureDate.toISOString().split("T")[0],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.purchaseDate).toBeDefined();
  });

  it("accepts today as purchaseDate", () => {
    const today = new Date().toISOString().split("T")[0];
    const result = validateCreateItem({ ...validInput, purchaseDate: today });
    expect(result.valid).toBe(true);
  });

  it("rejects empty purchaseDate", () => {
    const result = validateCreateItem({ ...validInput, purchaseDate: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.purchaseDate).toBeDefined();
  });

  it("rejects invalid date string", () => {
    const result = validateCreateItem({ ...validInput, purchaseDate: "not-a-date" });
    expect(result.valid).toBe(false);
    expect(result.errors.purchaseDate).toBeDefined();
  });

  it("returns multiple errors for multiple invalid fields", () => {
    const result = validateCreateItem({
      description: "",
      purchasePrice: 0,
      purchaseDate: "",
    });
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
  });
});

describe("validateSellItem", () => {
  it("accepts valid sale input", () => {
    const result = validateSellItem({ salePrice: 15.0, saleDate: "2024-02-01" });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rejects salePrice below 0.01", () => {
    const result = validateSellItem({ salePrice: 0, saleDate: "2024-02-01" });
    expect(result.valid).toBe(false);
    expect(result.errors.salePrice).toBeDefined();
  });

  it("rejects missing saleDate when salePrice is provided", () => {
    const result = validateSellItem({ salePrice: 15.0 });
    expect(result.valid).toBe(false);
    expect(result.errors.saleDate).toBeDefined();
  });

  it("rejects missing salePrice when saleDate is provided", () => {
    const result = validateSellItem({ saleDate: "2024-02-01" });
    expect(result.valid).toBe(false);
    expect(result.errors.salePrice).toBeDefined();
  });

  it("rejects both missing", () => {
    const result = validateSellItem({});
    expect(result.valid).toBe(false);
    expect(result.errors.salePrice).toBeDefined();
    expect(result.errors.saleDate).toBeDefined();
  });

  it("rejects invalid saleDate", () => {
    const result = validateSellItem({ salePrice: 15.0, saleDate: "invalid" });
    expect(result.valid).toBe(false);
    expect(result.errors.saleDate).toBeDefined();
  });

  it("accepts minimum salePrice of 0.01", () => {
    const result = validateSellItem({ salePrice: 0.01, saleDate: "2024-02-01" });
    expect(result.valid).toBe(true);
  });
});

describe("validateFolderName", () => {
  it("accepts valid folder name", () => {
    const result = validateFolderName("Electronics");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rejects empty name", () => {
    const result = validateFolderName("");
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects whitespace-only name", () => {
    const result = validateFolderName("   ");
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects name over 50 characters", () => {
    const result = validateFolderName("a".repeat(51));
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("accepts name of exactly 50 characters", () => {
    const result = validateFolderName("a".repeat(50));
    expect(result.valid).toBe(true);
  });

  it("accepts single character name", () => {
    const result = validateFolderName("A");
    expect(result.valid).toBe(true);
  });
});
