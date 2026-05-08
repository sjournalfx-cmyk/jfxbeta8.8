import { describe, expect, it } from 'vitest';
import { APP_CONSTANTS, PLAN_FEATURES, normalizePlan } from './constants';

describe('normalizePlan', () => {
  it('maps legacy plan names to canonical tiers', () => {
    expect(normalizePlan('FREE TIER (JOURNALER)')).toBe(APP_CONSTANTS.PLANS.FREE);
    expect(normalizePlan('PRO TIER (ANALYSTS)')).toBe(APP_CONSTANTS.PLANS.HOBBY);
    expect(normalizePlan('PREMIUM (MASTERS)')).toBe(APP_CONSTANTS.PLANS.STANDARD);
    expect(normalizePlan('ELITE MASTERS (PREMIUM)')).toBe(APP_CONSTANTS.PLANS.STANDARD);
    expect(normalizePlan('pro')).toBe(APP_CONSTANTS.PLANS.HOBBY);
  });

  it('falls back to the free tier for empty or unknown values', () => {
    expect(normalizePlan('')).toBe(APP_CONSTANTS.PLANS.FREE);
    expect(normalizePlan(undefined)).toBe(APP_CONSTANTS.PLANS.FREE);
    expect(normalizePlan('unknown-tier')).toBe(APP_CONSTANTS.PLANS.FREE);
  });
});

describe('PLAN_FEATURES', () => {
  it('exposes feature flags for the canonical plans', () => {
    expect(PLAN_FEATURES[APP_CONSTANTS.PLANS.FREE].allowImageUploads).toBe(false);
    expect(PLAN_FEATURES[APP_CONSTANTS.PLANS.HOBBY].allowImageUploads).toBe(true);
    expect(PLAN_FEATURES[APP_CONSTANTS.PLANS.STANDARD].directBrokerSync).toBe(true);
  });
});
