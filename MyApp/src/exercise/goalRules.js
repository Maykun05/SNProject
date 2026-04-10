// ค่าแนะนำเริ่มต้นของแอป (ผู้ใช้แก้ได้ผ่าน goalOverrides ต่อกิจกรรม)
export const ACTIVITY_GOAL_RULES = {
  walk: { type: 'or', checks: [{ metric: 'steps', min: 3000 }, { metric: 'duration', min: 20 * 60 }] },
  run: { type: 'or', checks: [{ metric: 'distance', min: 2 }, { metric: 'duration', min: 15 * 60 }] },
  bike: { type: 'or', checks: [{ metric: 'distance', min: 5 }, { metric: 'duration', min: 20 * 60 }] },
  gym: { type: 'or', checks: [{ metric: 'sets', min: 6 }, { metric: 'duration', min: 20 * 60 }] },
};

/** override ต่อกิจกรรม: { steps?, duration?, distance?, sets? } ค่า duration เป็นวินาที */
export const getEffectiveRule = (activityKey, activityOverride) => {
  const base = ACTIVITY_GOAL_RULES[activityKey];
  if (!base?.checks) return null;
  const o = activityOverride && typeof activityOverride === 'object' ? activityOverride : {};
  return {
    type: base.type,
    checks: base.checks.map((c) => {
      const v = o[c.metric];
      const useOverride = v != null && Number.isFinite(Number(v)) && Number(v) > 0;
      return {
        metric: c.metric,
        min: useOverride ? Number(v) : c.min,
      };
    }),
  };
};

export const metricValue = (session, metric) => {
  const raw = session?.[metric];
  if (raw == null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

/** ข้อความเป้าหมายของ metric เดียว (สำหรับ UI) */
export const describeMetricTarget = (metric, min) => {
  const n = Number(min);
  if (!Number.isFinite(n)) return '';
  switch (metric) {
    case 'steps':
      return `${Math.round(n).toLocaleString()} ก้าว`;
    case 'duration': {
      const sec = Math.round(n);
      if (sec >= 60) {
        const m = Math.round(sec / 60);
        return `${m} นาที`;
      }
      return `${sec} วินาที`;
    }
    case 'distance':
      return `${Number(n).toFixed(n % 1 === 0 ? 0 : 1)} กม.`;
    case 'sets':
      return `${Math.round(n)} เซต`;
    case 'reps':
      return `${Math.round(n)} ครั้ง`;
    case 'laps':
      return `${Math.round(n)} รอบ`;
    case 'calories':
      return `${Math.round(n)} kcal`;
    default:
      return `${n}`;
  }
};

/** สรุปเป้าหมายจาก rule ที่ resolve แล้ว */
export const summarizeRule = (rule) => {
  if (!rule?.checks?.length) return '';
  return rule.checks.map((c) => describeMetricTarget(c.metric, c.min)).join(' หรือ ');
};

/** สรุปเป้าหมายทั้งหมดของกิจกรรม (ข้อความเดียว) */
export const getActivityGoalSummary = (activityKey, customConfig, activityOverride) => {
  if (activityKey === 'custom') {
    const metric = customConfig?.metric;
    const target = Number(customConfig?.target);
    if (!metric || !Number.isFinite(target) || target <= 0) {
      return 'ตั้งเป้าจากหน้า Exercise';
    }
    return `ถึง ${describeMetricTarget(metric, target)}`;
  }
  const rule = getEffectiveRule(activityKey, activityOverride);
  return summarizeRule(rule);
};

/** สรุปเฉพาะค่าแนะนำ (ไม่รวม override) */
export const getDefaultGoalSummary = (activityKey) => {
  const rule = ACTIVITY_GOAL_RULES[activityKey];
  return summarizeRule(rule);
};

/**
 * snapshot สำหรับเช็ก goal แบบเรียลไทม์ — ให้ตรงรูปแบบกับ session ตอนบันทึก
 */
export const buildGoalSnapshot = ({
  activityKey,
  useAccelerometer,
  useGps,
  steps,
  distance,
  duration,
  calories,
  sets,
  reps,
  laps,
  metrics,
  customConfig,
}) => {
  const isCustom = activityKey === 'custom';
  const m = metrics || [];
  return {
    steps: useAccelerometer ? steps : null,
    distance: useGps ? distance : null,
    duration: duration ?? 0,
    calories: calories ?? 0,
    sets: m.includes('sets') ? sets : null,
    reps: m.includes('reps') ? reps : null,
    laps: m.includes('laps') ? laps : null,
    customGoal: isCustom ? customConfig : null,
  };
};

const formatSecAsMmSs = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

/** บรรทัดความคืบหน้าแบบสั้น ต่อ metric */
export const formatProgressVsTarget = (metric, current, target) => {
  const cur = Number(current) || 0;
  const tgt = Number(target) || 0;
  switch (metric) {
    case 'steps':
      return `${Math.round(cur).toLocaleString()} / ${Math.round(tgt).toLocaleString()} ก้าว`;
    case 'duration':
      return `${formatSecAsMmSs(cur)} / ${formatSecAsMmSs(tgt)}`;
    case 'distance':
      return `${cur.toFixed(2)} / ${Number(tgt).toFixed(2)} กม.`;
    case 'sets':
      return `${Math.round(cur)} / ${Math.round(tgt)} เซต`;
    case 'reps':
      return `${Math.round(cur)} / ${Math.round(tgt)} ครั้ง`;
    case 'laps':
      return `${Math.round(cur)} / ${Math.round(tgt)} รอบ`;
    case 'calories':
      return `${Math.round(cur)} / ${Math.round(tgt)} kcal`;
    default:
      return `${cur} / ${tgt}`;
  }
};

/** แต่ละทางของ OR + สถานะผ่าน */
export const getOrBranchProgress = (activityKey, customConfig, snapshot, activityOverride) => {
  if (activityKey === 'custom') {
    const metric = customConfig?.metric;
    const target = Number(customConfig?.target);
    if (!metric || !Number.isFinite(target) || target <= 0) {
      return [];
    }
    const cur = metricValue(snapshot, metric);
    return [{
      key: metric,
      metric,
      label: describeMetricTarget(metric, target),
      current: cur,
      target,
      done: cur >= target,
    }];
  }
  const rule = getEffectiveRule(activityKey, activityOverride);
  if (!rule?.checks?.length) return [];
  return rule.checks.map((check, i) => {
    const cur = metricValue(snapshot, check.metric);
    return {
      key: `${check.metric}-${i}`,
      metric: check.metric,
      label: describeMetricTarget(check.metric, check.min),
      current: cur,
      target: check.min,
      done: cur >= check.min,
    };
  });
};

export const isSessionQualified = (session, activityKey, activityOverride) => {
  if (activityKey === 'custom') {
    const metric = session?.customGoal?.metric;
    const min = Number(session?.customGoal?.target);
    if (!metric || !Number.isFinite(min) || min <= 0) return false;
    return metricValue(session, metric) >= min;
  }

  const rule = getEffectiveRule(activityKey, activityOverride);
  if (!rule) return false;
  if (rule.type !== 'or') return false;
  return rule.checks.some((check) => metricValue(session, check.metric) >= check.min);
};
