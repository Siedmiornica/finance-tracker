import { describe, it, expect } from "vitest";
import { deriveStatus } from "./status";

describe("deriveStatus", () => {
  it('returns "sold" when both salePrice and saleDate are non-null', () => {
    expect(deriveStatus({ salePrice: 1500, saleDate: "2024-01-15" })).toBe("sold");
  });

  it('returns "active" when salePrice is null', () => {
    expect(deriveStatus({ salePrice: null, saleDate: "2024-01-15" })).toBe("active");
  });

  it('returns "active" when saleDate is null', () => {
    expect(deriveStatus({ salePrice: 1500, saleDate: null })).toBe("active");
  });

  it('returns "active" when both salePrice and saleDate are null', () => {
    expect(deriveStatus({ salePrice: null, saleDate: null })).toBe("active");
  });
});
