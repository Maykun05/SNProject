import { API_URL } from '../config';

const BASE = `${API_URL}/api/exercise`;

export async function getExerciseDay(token, dateKey) {
  if (!token) return null;
  const res = await fetch(`${BASE}/day?date=${encodeURIComponent(dateKey)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) return null;
  return json.data;
}

export async function putExerciseDay(token, dateKey, plan, progress) {
  const res = await fetch(`${BASE}/day`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date: dateKey, plan, progress }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'putExerciseDay failed');
  }
  return json.data;
}
