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
