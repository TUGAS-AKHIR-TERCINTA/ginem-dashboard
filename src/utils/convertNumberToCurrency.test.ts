import { describe, expect, it } from "vitest";
import { convertNumberToCurrency, formatUSD } from "./convertNumberToCurrency";

describe("convertNumberToCurrency", () => {
  it("formats numbers with thousand separators and 2 decimals", () => {
    expect(convertNumberToCurrency(1234567.89)).toBe("1,234,567.89");
  });

  it("falls back to zero for nullish input", () => {
    expect(convertNumberToCurrency(null)).toBe("0.00");
  });
});

describe("formatUSD", () => {
  it("formats small values as USD currency", () => {
    expect(formatUSD(12.5)).toBe("$12.50");
  });

  it("abbreviates large values", () => {
    expect(formatUSD(1_500_000)).toBe("$1.50M");
    expect(formatUSD(2_500_000_000)).toBe("$2.50B");
    expect(formatUSD(3_500_000_000_000)).toBe("$3.50T");
  });
});
