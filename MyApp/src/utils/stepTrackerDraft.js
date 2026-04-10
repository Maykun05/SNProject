import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'exercise_step_draft_';

export function getStepTrackerDraftKey(planDate, instanceId) {
  if (!planDate || !instanceId) return null;
  return `${PREFIX}${planDate}_${instanceId}`;
}

export async function loadStepTrackerDraft(planDate, instanceId) {
  const key = getStepTrackerDraftKey(planDate, instanceId);
  if (!key) return null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d.planDate !== planDate || d.instanceId !== instanceId) return null;
    return d;
  } catch {
    return null;
  }
}

export async function saveStepTrackerDraft(planDate, instanceId, payload) {
  const key = getStepTrackerDraftKey(planDate, instanceId);
  if (!key) return;
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        ...payload,
        planDate,
        instanceId,
      })
    );
  } catch (e) {
    console.warn('saveStepTrackerDraft:', e);
  }
}

export async function clearStepTrackerDraft(planDate, instanceId) {
  const key = getStepTrackerDraftKey(planDate, instanceId);
  if (!key) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('clearStepTrackerDraft:', e);
  }
}
