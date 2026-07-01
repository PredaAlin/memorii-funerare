import { MemorialPlan } from '@/types'

/**
 * Canonical, server-authoritative plan prices (RON).
 *
 * SECURITY: never trust a client-supplied price at order creation. The cart
 * lives in the browser and is fully attacker-controllable, so the amount
 * charged (and stored) must be looked up here by plan, server-side.
 */
export const PLAN_PRICES: Record<MemorialPlan, number> = {
  basic: 149.99,
  premium: 199.99,
}

export function isValidPlan(plan: unknown): plan is MemorialPlan {
  return plan === 'basic' || plan === 'premium'
}
