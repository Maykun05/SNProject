import { saveSleep, getSleepByUser } from '../services/sleepService.js';
export const saveSleepController = async (req, res) => {
  try {
    const userId = req.user.id; // สมมติ auth middleware ใส่ user เข้า req
    const { hours } = req.body;

    const sleep = await saveSleep(userId, hours);
    res.json(sleep);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSleepController = async (req, res) => {
  try {
    const userId = req.user.id;
    const sleeps = await getSleepByUser(userId);

    if (!sleeps || sleeps.length === 0) {
      return res.status(404).json({ message: "No sleep records found" });
    }

    res.json(sleeps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
