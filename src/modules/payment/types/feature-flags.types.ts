export interface FeatureFlags {
  access_by_code: boolean;
  visitor_management: boolean;
  domestic_staff_management: boolean;
  community_chat: boolean;
  ice_emergency_alerts: boolean;
  collections_and_payments: boolean;
  reporting_and_analytics: boolean;
  issue_tracking: boolean;
}

export type FeatureName = keyof FeatureFlags;

export type SubscriptionState = 'TRIAL' | 'ACTIVE' | 'GRACE' | 'LAPSED';

// Feature flags by subscription state
export const FEATURE_FLAGS_BY_STATE: Record<SubscriptionState, FeatureFlags> = {
  TRIAL: {
    access_by_code: true,
    visitor_management: true,
    domestic_staff_management: true,
    community_chat: true,
    ice_emergency_alerts: true,
    collections_and_payments: true,
    reporting_and_analytics: true,
    issue_tracking: true,
  },
  ACTIVE: {
    access_by_code: true,
    visitor_management: true,
    domestic_staff_management: true,
    community_chat: true,
    ice_emergency_alerts: true,
    collections_and_payments: true,
    reporting_and_analytics: true,
    issue_tracking: true,
  },
  GRACE: {
    access_by_code: true,
    visitor_management: false,
    domestic_staff_management: false,
    community_chat: true,
    ice_emergency_alerts: true,
    collections_and_payments: true,
    reporting_and_analytics: false,
    issue_tracking: false,
  },
  LAPSED: {
    access_by_code: false,
    visitor_management: false,
    domestic_staff_management: false,
    community_chat: false,
    ice_emergency_alerts: true,
    collections_and_payments: true,
    reporting_and_analytics: false,
    issue_tracking: false,
  },
};

// Calculate days since lapsed for gradual degradation
export function getDaysSinceLapsed(lapsedStartDate: Date | null): number {
  if (!lapsedStartDate) return 0;
  const now = new Date();
  const diffMs = now.getTime() - lapsedStartDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Get feature flags with gradual degradation for LAPSED state
export function getFeatureFlagsForLapsedState(daysSinceLapsed: number): FeatureFlags {
  // Day 1-7: Everything works
  if (daysSinceLapsed <= 7) {
    return {
      access_by_code: true,
      visitor_management: true,
      domestic_staff_management: true,
      community_chat: true,
      ice_emergency_alerts: true,
      collections_and_payments: true,
      reporting_and_analytics: true,
      issue_tracking: true,
    };
  }

  // Day 8-14: Reporting and analytics disabled
  if (daysSinceLapsed <= 14) {
    return {
      access_by_code: true,
      visitor_management: true,
      domestic_staff_management: true,
      community_chat: true,
      ice_emergency_alerts: true,
      collections_and_payments: true,
      reporting_and_analytics: false,
      issue_tracking: true,
    };
  }

  // Day 15-21: Visitor management disabled, new domestic staff blocked
  if (daysSinceLapsed <= 21) {
    return {
      access_by_code: true,
      visitor_management: false,
      domestic_staff_management: false,
      community_chat: true,
      ice_emergency_alerts: true,
      collections_and_payments: true,
      reporting_and_analytics: false,
      issue_tracking: true,
    };
  }

  // Day 22-30: Manager portal read-only (handled at route level)
  if (daysSinceLapsed <= 30) {
    return {
      access_by_code: true,
      visitor_management: false,
      domestic_staff_management: false,
      community_chat: true,
      ice_emergency_alerts: true,
      collections_and_payments: true,
      reporting_and_analytics: false,
      issue_tracking: false,
    };
  }

  // Day 31+: Manager portal locked, only ICE and collections
  return FEATURE_FLAGS_BY_STATE.LAPSED;
}

// Get feature flags for an estate based on subscription state
export function getFeatureFlags(
  subscriptionState: SubscriptionState,
  lapsedStartDate: Date | null = null
): FeatureFlags {
  if (subscriptionState === 'LAPSED' && lapsedStartDate) {
    const daysSinceLapsed = getDaysSinceLapsed(lapsedStartDate);
    return getFeatureFlagsForLapsedState(daysSinceLapsed);
  }

  return FEATURE_FLAGS_BY_STATE[subscriptionState];
}
