import { describe, expect, it, beforeEach } from 'vitest';
import { getSastHourFromTrade, setDefaultTimezone, getDefaultTimezone, getTimezoneLabel, getDateTimeInTimezone } from './timeUtils';

const DEFAULT_TZ = 'Africa/Johannesburg';
const NY_TZ = 'America/New_York';

beforeEach(() => {
  setDefaultTimezone(DEFAULT_TZ);
});

describe('setDefaultTimezone / getDefaultTimezone', () => {
  it('defaults to Africa/Johannesburg', () => {
    expect(getDefaultTimezone()).toBe(DEFAULT_TZ);
  });

  it('updates the default timezone', () => {
    setDefaultTimezone(NY_TZ);
    expect(getDefaultTimezone()).toBe(NY_TZ);
  });
});

describe('getTimezoneLabel', () => {
  it('returns the default timezone when no argument given', () => {
    expect(getTimezoneLabel()).toBe(DEFAULT_TZ);
  });

  it('returns the provided timezone', () => {
    expect(getTimezoneLabel(NY_TZ)).toBe(NY_TZ);
  });
});

describe('getSastHourFromTrade', () => {
  it('prefers openTime over the legacy time field for hourly analytics', () => {
    const hour = getSastHourFromTrade({
      date: '2026-05-02',
      time: '10:30',
      openTime: '2026-05-02T10:00:00+02:00',
      closeTime: '2026-05-02T10:30:00+02:00',
    });

    expect(hour).toBe(10);
  });

  it('falls back to time when openTime is unavailable', () => {
    const hour = getSastHourFromTrade({
      date: '2026-05-02',
      time: '14:45',
    });

    expect(hour).toBe(14);
  });

  it('respects a different timezone parameter', () => {
    const hour = getSastHourFromTrade({
      date: '2026-05-02',
      time: '14:45',
    }, NY_TZ);

    expect(hour).toBe(14);
  });
});

describe('getDateTimeInTimezone', () => {
  it('returns date parts in the specified timezone', () => {
    const may2 = new Date('2026-05-02T12:00:00Z');
    const result = getDateTimeInTimezone(may2, 'America/New_York');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('time');
    expect(result).toHaveProperty('hour');
    expect(result).toHaveProperty('dayIndex');
  });
});
