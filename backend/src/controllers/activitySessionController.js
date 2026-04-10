import {
  createActivitySession,
  getUserActivitySessionHistory,
  listActivitySessionsForPlanInstance,
} from '../services/activitySessionService.js';

function sameJson(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

export const saveActivitySession = async (req, res) => {
  try {
    const userId = req.user.id;
    const b = req.body || {};
    const {
      steps,
      distance,
      calories,
      duration,
      date,
      route,
      planDate,
      instanceId,
      mode,
      activityKey,
      laps,
      sets,
      reps,
      customGoal,
      isQualified,
    } = b;

    const routeStr =
      route == null
        ? null
        : typeof route === 'string'
          ? route
          : JSON.stringify(route);

    const session = await createActivitySession(userId, {
      steps: steps != null ? Math.round(Number(steps)) || 0 : 0,
      distance: distance != null ? Number(distance) || 0 : 0,
      calories: calories != null ? Math.round(Number(calories)) || 0 : 0,
      duration: Math.round(Number(duration)) || 0,
      date: date ? new Date(date) : new Date(),
      route: routeStr,
      planDateKey: planDate != null ? String(planDate) : null,
      instanceId: instanceId != null ? String(instanceId) : null,
      activityKey: (activityKey != null ? String(activityKey) : mode != null ? String(mode) : null) || null,
      laps: laps != null ? Math.round(Number(laps)) : null,
      sets: sets != null ? Math.round(Number(sets)) : null,
      reps: reps != null ? Math.round(Number(reps)) : null,
      customGoalJson: customGoal !== undefined ? customGoal : null,
      isQualified: typeof isQualified === 'boolean' ? isQualified : null,
    });
    res.json(session);
  } catch (err) {
    console.error('saveActivitySession', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLatestActivitySessionForInstance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planDate, instanceId, activityKey, customGoal } = req.query || {};
    if (!planDate || !instanceId || !activityKey) {
      return res.status(400).json({ message: 'planDate, instanceId, activityKey required' });
    }
    let customParsed = null;
    if (typeof customGoal === 'string' && customGoal.length > 0) {
      try {
        customParsed = JSON.parse(customGoal);
      } catch {
        customParsed = null;
      }
    }
    const rows = await listActivitySessionsForPlanInstance(
      userId,
      String(planDate),
      String(instanceId),
      String(activityKey),
      30
    );
    const picked =
      activityKey === 'custom'
        ? rows.find((r) => sameJson(r.customGoalJson, customParsed))
        : rows[0];
    if (!picked) {
      return res.json(null);
    }
    let routeParsed = null;
    if (picked.route) {
      try {
        routeParsed = JSON.parse(picked.route);
      } catch {
        routeParsed = null;
      }
    }
    return res.json({
      mode: picked.activityKey,
      planDate: picked.planDateKey,
      instanceId: picked.instanceId,
      date: picked.date,
      steps: picked.steps,
      distance: picked.distance,
      calories: picked.calories,
      duration: picked.duration,
      route: Array.isArray(routeParsed) ? routeParsed : [],
      laps: picked.laps,
      sets: picked.sets,
      reps: picked.reps,
      customGoal: picked.customGoalJson,
      isQualified: picked.isQualified,
    });
  } catch (err) {
    console.error('getLatestActivitySessionForInstance', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivitySessionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await getUserActivitySessionHistory(userId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
