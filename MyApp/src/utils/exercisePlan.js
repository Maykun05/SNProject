import { getEffectiveRule } from '../exercise/goalRules';
import { ACTIVITY_TEMPLATES, DEFAULT_ACTIVITY_KEY } from '../exercise/activityTemplates';

export const PLAN_STORAGE_KEY = 'exercise_plan_';
export const PROGRESS_STORAGE_KEY = 'exercise_progress_';

export const GOAL_EDITABLE_KEYS = ['walk', 'run', 'bike', 'gym'];

/** โควตาโบนัส XP ต่อวัน (แสดงเป็นตัวหาร x/3) */
export const EXERCISE_DAILY_BONUS_SLOTS = 3;

export function getExercisePlanDateKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function newExerciseInstanceId() {
  return `ex-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function parsePositiveInt(s, fallback) {
  const n = parseInt(String(s).replace(/\D/g, ''), 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parsePositiveFloat(s, fallback) {
  const n = parseFloat(String(s).replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

/**
 * @param {string} activityKey
 * @param {object | null | undefined} activityOverride - override ของกิจกรรมเดียว (หรือจาก map เดิม: pass goalOverrides?.[key])
 */
export function openGoalEditorValues(activityKey, activityOverride) {
  const o = activityOverride && typeof activityOverride === 'object' ? activityOverride : null;
  const rule = getEffectiveRule(activityKey, o);
  const by = {};
  rule?.checks?.forEach((c) => {
    by[c.metric] = c.min;
  });
  if (activityKey === 'walk') {
    return {
      a: String(Math.round(by.steps ?? 3000)),
      b: String(Math.round((by.duration ?? 20 * 60) / 60)),
      labelA: 'เป้าก้าว',
      labelB: 'เป้าเวลา (นาที)',
    };
  }
  if (activityKey === 'run' || activityKey === 'bike') {
    return {
      a: String(by.distance ?? (activityKey === 'run' ? 2 : 5)),
      b: String(Math.round((by.duration ?? (activityKey === 'run' ? 15 * 60 : 20 * 60)) / 60)),
      labelA: 'ระยะทาง (กม.)',
      labelB: 'เวลา (นาที)',
    };
  }
  if (activityKey === 'gym') {
    return {
      a: String(Math.round(by.sets ?? 6)),
      b: String(Math.round((by.duration ?? 20 * 60) / 60)),
      labelA: 'เซต',
      labelB: 'เวลา (นาที)',
    };
  }
  return { a: '', b: '', labelA: '', labelB: '' };
}

export function buildOverrideFromEditor(activityKey, a, b) {
  if (activityKey === 'walk') {
    const steps = parsePositiveInt(a, 3000);
    const min = parsePositiveInt(b, 20);
    return { steps, duration: min * 60 };
  }
  if (activityKey === 'run' || activityKey === 'bike') {
    const dist = parsePositiveFloat(a, activityKey === 'run' ? 2 : 5);
    const min = parsePositiveInt(b, activityKey === 'run' ? 15 : 20);
    return { distance: dist, duration: min * 60 };
  }
  if (activityKey === 'gym') {
    const sets = parsePositiveInt(a, 6);
    const min = parsePositiveInt(b, 20);
    return { sets, duration: min * 60 };
  }
  return {};
}

export function customStep(metric) {
  return metric === 'distance' ? 0.5 : metric === 'duration' ? 60 : 1;
}

export function formatTarget(value, metric) {
  if (metric === 'duration') return `${Math.round(value)} sec`;
  if (metric === 'distance') return `${Number(value).toFixed(1)} km`;
  return String(Math.round(value));
}

export function sanitizeActivityInstances(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x) => x && typeof x === 'object' && typeof x.id === 'string' && ACTIVITY_TEMPLATES[x.templateKey])
    .map((x) => ({
      id: x.id,
      templateKey: x.templateKey,
      goalOverride: x.goalOverride && typeof x.goalOverride === 'object' ? x.goalOverride : null,
      customConfig:
        x.templateKey === 'custom' && x.customConfig && typeof x.customConfig === 'object'
          ? {
              metric: x.customConfig.metric || 'duration',
              target: Number.isFinite(Number(x.customConfig.target)) ? Number(x.customConfig.target) : 900,
            }
          : x.templateKey === 'custom'
            ? { metric: 'duration', target: 900 }
            : null,
    }));
}

export function sanitizeExerciseXpGrantedIds(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const out = [];
  for (const id of arr) {
    if (typeof id !== 'string' || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= EXERCISE_DAILY_BONUS_SLOTS) break;
  }
  return out;
}

function buildLegacyInstances(plan) {
  let selected =
    Array.isArray(plan.selectedActivities) && plan.selectedActivities.length > 0
      ? plan.selectedActivities.filter((k) => !!ACTIVITY_TEMPLATES[k])
      : [DEFAULT_ACTIVITY_KEY];
  if (selected.length === 0) selected = [DEFAULT_ACTIVITY_KEY];
  return selected.map((templateKey, index) => {
    const id = `legacy:${index}:${templateKey}`;
    if (templateKey === 'custom') {
      return {
        id,
        templateKey,
        goalOverride: null,
        customConfig: {
          metric: plan.customMetric || 'duration',
          target: Number.isFinite(Number(plan.customTarget)) ? Number(plan.customTarget) : 900,
        },
      };
    }
    const ov = plan.goalOverrides?.[templateKey];
    return {
      id,
      templateKey,
      goalOverride: ov && typeof ov === 'object' ? ov : null,
      customConfig: null,
    };
  });
}

function resolveProgressByInstanceId(instances, progressRaw) {
  const pr = progressRaw && typeof progressRaw === 'object' ? progressRaw : {};
  const ids = new Set(instances.map((i) => i.id));
  const keys = Object.keys(pr);
  const truthyKeys = keys.filter((k) => pr[k]);
  const allTruthyAreInstanceIds = truthyKeys.length > 0 && truthyKeys.every((k) => ids.has(k));
  const out = {};
  if (allTruthyAreInstanceIds) {
    truthyKeys.forEach((k) => {
      if (ids.has(k)) out[k] = true;
    });
    return out;
  }
  instances.forEach((inst) => {
    if (pr[inst.id]) out[inst.id] = true;
    else if (pr[inst.templateKey]) out[inst.id] = true;
  });
  return out;
}

/**
 * คืน plan object สำหรับบันทึก + progress map + grants
 * @returns {{ planObject: object, progressById: Record<string, boolean>, exerciseXpGrantedInstanceIds: string[] }}
 */
export function normalizeExerciseState(planRaw, progressRaw) {
  const plan = planRaw && typeof planRaw === 'object' ? planRaw : {};
  let instances = sanitizeActivityInstances(plan.activityInstances);
  let legacyMigrated = false;

  if (instances.length === 0) {
    const hasLegacyShape =
      (Array.isArray(plan.selectedActivities) && plan.selectedActivities.length > 0) ||
      (plan.goalOverrides && typeof plan.goalOverrides === 'object' && Object.keys(plan.goalOverrides).length > 0) ||
      plan.customMetric ||
      Number.isFinite(Number(plan.customTarget));
    if (hasLegacyShape) {
      const merged = {
        ...plan,
        selectedActivities:
          Array.isArray(plan.selectedActivities) && plan.selectedActivities.length > 0
            ? plan.selectedActivities
            : [DEFAULT_ACTIVITY_KEY],
      };
      instances = buildLegacyInstances(merged);
      legacyMigrated = true;
    }
  }

  const progressById = resolveProgressByInstanceId(instances, progressRaw);

  let exerciseXpGrantedInstanceIds;
  if (legacyMigrated) {
    exerciseXpGrantedInstanceIds = instances
      .filter((i) => progressById[i.id])
      .map((i) => i.id)
      .slice(0, EXERCISE_DAILY_BONUS_SLOTS);
  } else if (plan.exerciseXpGrantedInstanceIds === undefined) {
    exerciseXpGrantedInstanceIds = instances
      .filter((i) => progressById[i.id])
      .map((i) => i.id)
      .slice(0, EXERCISE_DAILY_BONUS_SLOTS);
  } else {
    exerciseXpGrantedInstanceIds = sanitizeExerciseXpGrantedIds(plan.exerciseXpGrantedInstanceIds);
  }

  const prevTs = Number(plan.clientUpdatedAt);
  const planObject = {
    activityInstances: instances,
    exerciseXpGrantedInstanceIds,
    ...(Number.isFinite(prevTs) && prevTs > 0 ? { clientUpdatedAt: prevTs } : {}),
  };

  return { planObject, progressById, exerciseXpGrantedInstanceIds, activityInstances: instances };
}

export function buildPlanForStorage(activityInstances, exerciseXpGrantedInstanceIds) {
  return {
    activityInstances: sanitizeActivityInstances(activityInstances),
    exerciseXpGrantedInstanceIds: sanitizeExerciseXpGrantedIds(exerciseXpGrantedInstanceIds),
    clientUpdatedAt: Date.now(),
  };
}
