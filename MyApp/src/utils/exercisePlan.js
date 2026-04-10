import { getEffectiveRule } from '../exercise/goalRules';

export const PLAN_STORAGE_KEY = 'exercise_plan_';
export const PROGRESS_STORAGE_KEY = 'exercise_progress_';

export const GOAL_EDITABLE_KEYS = ['walk', 'run', 'bike', 'gym'];

export function getExercisePlanDateKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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

export function openGoalEditorValues(activityKey, goalOverrides) {
  const rule = getEffectiveRule(activityKey, goalOverrides[activityKey]);
  const by = {};
  rule?.checks?.forEach((c) => { by[c.metric] = c.min; });
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
