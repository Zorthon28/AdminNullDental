// Pricing plans for NullDental licenses
export interface PricingPlan {
  id: string;
  name: string;
  type: "Standalone" | "Subscription";
  monthlyPrice: number; // MXN
  yearlyPrice: number; // MXN
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cache for pricing plans
let pricingPlansCache: PricingPlan[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getPricingPlans(): Promise<PricingPlan[]> {
  // Return cached data if still valid
  if (pricingPlansCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return pricingPlansCache;
  }

  try {
    const response = await fetch("/api/pricing-plans");
    if (response.ok) {
      const plans = await response.json();
      pricingPlansCache = plans;
      cacheTimestamp = Date.now();
      return plans;
    }
  } catch (error) {
    console.error("Failed to fetch pricing plans:", error);
  }

  // Fallback to empty array if API fails
  return [];
}

export async function getPricingPlan(
  planId: string
): Promise<PricingPlan | undefined> {
  const plans = await getPricingPlans();
  return plans.find((plan) => plan.id === planId);
}

export async function getPlansByType(
  type: "Standalone" | "Subscription"
): Promise<PricingPlan[]> {
  const plans = await getPricingPlans();
  return plans.filter((plan) => plan.type === type);
}

// For backward compatibility - returns empty array initially
export const PRICING_PLANS: PricingPlan[] = [];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

// Function to invalidate cache when pricing plans are updated
export function invalidatePricingCache(): void {
  pricingPlansCache = null;
  cacheTimestamp = 0;
}
