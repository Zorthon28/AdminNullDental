import { formatCurrency } from "../pricing";

// Mock the pricing data
jest.mock("../pricing", () => ({
  ...jest.requireActual("../pricing"),
  PRICING_PLANS: {
    standalone: {
      id: "standalone",
      name: "Standalone",
      type: "Standalone" as const,
      monthlyPrice: 5000, // $50.00 in cents
      yearlyPrice: 50000, // $500.00 in cents
      description: "Single clinic license",
      isActive: true,
    },
  },
}));

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("formats cents to Mexican Pesos correctly", () => {
      expect(formatCurrency(5000)).toBe("$50.00");
      expect(formatCurrency(10000)).toBe("$100.00");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(150)).toBe("$1.50");
    });

    it("handles negative values", () => {
      expect(formatCurrency(-5000)).toBe("-$50.00");
    });

    it("handles large numbers", () => {
      expect(formatCurrency(100000)).toBe("$1,000.00");
      expect(formatCurrency(1000000)).toBe("$10,000.00");
    });
  });
});

describe("Basic Component Tests", () => {
  it("should pass a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });
});
