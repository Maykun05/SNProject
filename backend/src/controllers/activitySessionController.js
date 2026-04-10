import {
  createActivitySession,
  getUserActivitySessionHistory,
} from '../services/activitySessionService.js';

export const saveActivitySession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps, distance, calories, duration, date, route } = req.body;
    const session = await createActivitySession(userId, {
      steps,
      distance,
      calories,
      duration,
      date,
      route: JSON.stringify(route),
    });
    res.json(session);
  } catch (err) {
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
