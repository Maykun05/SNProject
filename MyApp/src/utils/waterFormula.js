/** activityLevel (1–5) → ชั่วโมงออกกำลังกายสำหรับสูตรน้ำ */
export function exerciseHoursFromActivityLevel(level) {
  const n = Number(level);
  const map = { 1: 0, 2: 0.5, 3: 1, 4: 1.5, 5: 2 };
  return map[n] ?? 0;
}

/** ปริมาณน้ำแนะนำ (มล.) = น้ำหนัก(kg)×33 + ชม.ออกกำลัง×600 */
export function recommendedWaterMl(weightKg, activityLevel) {
  const w = Number(weightKg) || 0;
  const hours = exerciseHoursFromActivityLevel(activityLevel);
  return Math.round(w * 33 + hours * 600);
}
