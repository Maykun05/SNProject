import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'STEP_SESSIONS';

function customGoalMatchKey(g) {
  if (!g || typeof g !== 'object') return 'null';
  const metric = g.metric || 'duration';
  const target = Number(g.target);
  return `${metric}:${Number.isFinite(target) ? target : ''}`;
}

function sameCustomGoal(a, b) {
  return customGoalMatchKey(a) === customGoalMatchKey(b);
}

function dateKeyFromSessionIso(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return null;
  }
}

/**
 * @param {Array} sessions
 * @returns {object | null}
 */
export function pickLatestMatchingSession(sessions, planDate, instanceId, activityKey, customConfig) {
  if (!Array.isArray(sessions) || !planDate || !instanceId || !activityKey) return null;
  for (let i = sessions.length - 1; i >= 0; i -= 1) {
    const s = sessions[i];
    if (!s || typeof s !== 'object') continue;
    if (s.planDate !== planDate || s.instanceId !== instanceId) continue;
    const mode = s.mode ?? s.activityKey;
    if (mode !== activityKey) continue;
    if (activityKey === 'custom' && !sameCustomGoal(s.customGoal, customConfig)) continue;
    return s;
  }
  for (let i = sessions.length - 1; i >= 0; i -= 1) {
    const s = sessions[i];
    if (!s || typeof s !== 'object') continue;
    if (s.planDate != null || s.instanceId != null) continue;
    const mode = s.mode ?? s.activityKey;
    if (mode !== activityKey) continue;
    if (activityKey === 'custom' && !sameCustomGoal(s.customGoal, customConfig)) continue;
    if (dateKeyFromSessionIso(s.date) !== planDate) continue;
    return s;
  }
  return null;
}

/** แปลง draft / เซสชันที่บันทึก / payload จาก API ให้เป็นตัวเลขสำหรับ hydrate */
export function extractHydrationFields(rec) {
  if (!rec || typeof rec !== 'object') return null;
  const et = Math.max(0, Math.round(Number(rec.elapsedTime ?? rec.duration) || 0));
  const st = rec.steps != null ? Math.max(0, Math.round(Number(rec.steps) || 0)) : 0;
  const dist = rec.distance != null ? Math.max(0, Number(rec.distance) || 0) : 0;
  const cal = Math.max(0, Math.round(Number(rec.calories) || 0));
  const nl = rec.laps != null ? Math.max(0, Math.round(Number(rec.laps) || 0)) : 0;
  const ns = rec.sets != null ? Math.max(0, Math.round(Number(rec.sets) || 0)) : 0;
  const nr = rec.reps != null ? Math.max(0, Math.round(Number(rec.reps) || 0)) : 0;
  const coords = Array.isArray(rec.routeCoords)
    ? rec.routeCoords
    : Array.isArray(rec.route)
      ? rec.route
      : [];
  return { et, st, dist, cal, nl, ns, nr, coords };
}

/**
 * เซสชันล่าสุดที่บันทึกแล้วสำหรับ instance + วัน + กิจกรรม (สแกนจากท้ายอาร์เรย์)
 * รองรับเซสชันเก่าที่ไม่มี planDate/instanceId (แมตช์จากวันที่บันทึก + mode เท่านั้น)
 */
export async function loadLatestSavedStepSession(planDate, instanceId, activityKey, customConfig) {
  if (!planDate || !instanceId || !activityKey) return null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    let sessions = [];
    if (raw) {
      try {
        sessions = JSON.parse(raw);
      } catch {
        sessions = [];
      }
    }
    if (!Array.isArray(sessions)) return null;
    return pickLatestMatchingSession(sessions, planDate, instanceId, activityKey, customConfig);
  } catch {
    return null;
  }
}
