import { API_URL } from '../config';

const BASE = `${API_URL}/api/activity-sessions`;

export async function postActivitySession(token, session) {
  if (!token) return null;
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || 'postActivitySession failed');
  }
  return res.json().catch(() => ({}));
}

export async function getLatestActivitySessionForInstance(
  token,
  { planDate, instanceId, activityKey, customConfig }
) {
  if (!token || !planDate || !instanceId || !activityKey) return null;
  const q = new URLSearchParams({
    planDate: String(planDate),
    instanceId: String(instanceId),
    activityKey: String(activityKey),
  });
  if (activityKey === 'custom' && customConfig != null) {
    q.set('customGoal', JSON.stringify(customConfig));
  }
  const res = await fetch(`${BASE}/latest?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data;
}
