import { API_URL } from '../config';

export function localCalendarDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function fetchWaterToday(token, day) {
  const res = await fetch(`${API_URL}/api/water/today?day=${encodeURIComponent(day)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteWaterLog(token, logId) {
  const res = await fetch(`${API_URL}/api/water/log/${logId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function postWaterLog(token, amountMl, day) {
  const res = await fetch(`${API_URL}/api/water/log`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amountMl, day }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function putProfileWaterGoal(token, waterGoal) {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ waterGoal }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || 'อัปเดตเป้าไม่สำเร็จ');
  }
  return res.json();
}
