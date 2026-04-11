import { API_URL } from '../config';

const API_BASE = `${API_URL}/api`;
const DEFAULT_TIMEOUT_MS = 10000;

const withTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const parseJsonOrThrow = async (res, endpointName) => {
  let json = {};
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(`${endpointName}-invalid-json`);
  }

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `${endpointName}-failed`);
  }

  return json?.data ?? {};
};

export const fetchFeatureStats7d = async (token) => {
  if (!token) throw new Error('missing-auth-token');

  const res = await withTimeout(
    `${API_BASE}/stats/feature-7d`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    DEFAULT_TIMEOUT_MS,
  );

  return parseJsonOrThrow(res, 'feature-stats');
};

const DEFAULT_SUMMARY_TOTALS = {
  sessions: 0,
  steps: 0,
  durationSec: 0,
  calories: 0,
  distance: 0,
};

const DEFAULT_FEATURE_STATS = {
  dateRange: { startDate: null, endDate: null },
  feature: 'water',
  range: '7d',
  granularity: 'day',
  unit: 'count',
  summary: {
    total: 0,
    activeDays: 0,
    average: 0,
    peakValue: 0,
    peakDate: null,
    totals: { ...DEFAULT_SUMMARY_TOTALS },
  },
  series: [],
};

const normalizeFeatureStats = (payload = {}, fallback = {}) => ({
  ...DEFAULT_FEATURE_STATS,
  ...fallback,
  ...payload,
  dateRange: {
    ...DEFAULT_FEATURE_STATS.dateRange,
    ...(fallback?.dateRange ?? {}),
    ...(payload?.dateRange ?? {}),
  },
  summary: {
    ...DEFAULT_FEATURE_STATS.summary,
    ...(fallback?.summary ?? {}),
    ...(payload?.summary ?? {}),
    totals: {
      ...DEFAULT_SUMMARY_TOTALS,
      ...(fallback?.summary?.totals ?? {}),
      ...(payload?.summary?.totals ?? {}),
    },
  },
  series: Array.isArray(payload?.series) ? payload.series : [],
});

export const fetchFeatureStats = async ({
  token,
  feature = 'water',
  range = '7d',
  startDate = null,
  endDate = null,
}) => {
  if (!token) throw new Error('missing-auth-token');
  const params = new URLSearchParams({ feature, range });
  if (startDate && endDate) {
    params.set('startDate', startDate);
    params.set('endDate', endDate);
  }
  const res = await withTimeout(
    `${API_BASE}/stats/feature?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    DEFAULT_TIMEOUT_MS,
  );
  const data = await parseJsonOrThrow(res, 'feature-stats-query');
  return normalizeFeatureStats(data, {
    feature,
    range: startDate && endDate ? 'custom' : range,
    dateRange: startDate && endDate ? { startDate, endDate } : undefined,
  });
};
