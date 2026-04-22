import { API_URL } from '../config';

async function parseError(res) {
  const j = await res.json().catch(() => ({}));
  return j.message || `HTTP ${res.status}`;
}

/**
 * รายการอาหารที่บันทึกวันนี้
 * @param {string} token
 * @returns {Promise<Array>}
 */
export async function fetchFoodToday(token) {
  const res = await fetch(`${API_URL}/api/food/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * บันทึกมื้ออาหาร
 * @param {string} token
 * @param {{ name: string, calories: number, protein?: number, carbs?: number, fat?: number }} payload
 */
export async function createFood(token, payload) {
  const res = await fetch(`${API_URL}/api/food`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * ค้นหาอาหารจากชื่อ (จากฐานข้อมูล)
 * @param {string} token
 * @param {string} name
 * @returns {Promise<Object|null>}
 */
export async function searchFoodByName(token, name) {
  const res = await fetch(`${API_URL}/api/food/search?name=${encodeURIComponent(name)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * บันทึกอาหารลงใน FoodDatabase (global cache)
 * @param {{ name: string, calories: number, protein?: number, carbs?: number, fat?: number }} payload
 */
export async function saveFoodToDatabase(payload) {
  const res = await fetch(`${API_URL}/api/food/database/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * ลบรายการอาหาร
 * @param {string} token
 * @param {string|number} foodId
 */
export async function deleteFood(token, foodId) {
  const res = await fetch(`${API_URL}/api/food/${foodId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json().catch(() => ({}));
}
