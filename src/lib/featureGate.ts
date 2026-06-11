export type MembershipTier = "free" | "pro";

export function featureGate(tier: MembershipTier, feature: string): boolean {
  void tier;
  void feature;
  return true;
}
