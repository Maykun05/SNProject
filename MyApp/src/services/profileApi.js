import { API_URL } from '../config';

export async function putProfileCalorieGoal(token, calorieGoal) {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ calorieGoal }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || 'อัปเดตเป้าแคลไม่สำเร็จ');
  }
  return res.json();
}
