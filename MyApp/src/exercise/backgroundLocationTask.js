import * as TaskManager from 'expo-task-manager';

export const EXERCISE_BG_LOCATION_TASK = 'exercise-bg-location-v1';

const queue = [];

TaskManager.defineTask(EXERCISE_BG_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    return;
  }
  const locs = data?.locations ?? [];
  for (const loc of locs) {
    const { latitude, longitude } = loc.coords || {};
    if (latitude != null && longitude != null) {
      queue.push({ latitude, longitude });
    }
  }
});

export function drainExerciseBackgroundCoords() {
  if (queue.length === 0) return [];
  const out = queue.slice();
  queue.length = 0;
  return out;
}
