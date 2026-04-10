import { API_URL } from '../config';

/**
 * GET /api/missions/sync — คำนวณความคืบหน้าจาก log จริง, จ่ายเหรียญครั้งแรกเมื่อครบเป้า (idempotent ต่อ user/mission/period)
 * @param {string} userToken Bearer token
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function fetchMissionsSync(userToken) {
  if (!userToken) {
    return { success: false, message: 'No token' };
  }
  try {
    const res = await fetch(`${API_URL}/api/missions/sync`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: body?.message || `HTTP ${res.status}` };
    }
    return body;
  } catch (e) {
    console.error('fetchMissionsSync error:', e);
    return { success: false, message: e?.message || 'Network error' };
  }
}
