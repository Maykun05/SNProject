import { createStepSession, getUserStepHistory } from '../services/stepService.js';

export const saveStepSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps, distance, calories, duration, date, route } = req.body;
    const session = await createStepSession(userId, {
      steps, distance, calories, duration, date,
      route: JSON.stringify(route),
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStepHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await getUserStepHistory(userId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};