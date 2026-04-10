import prisma from "../config/prisma.js";
import { syncMissionsForUser } from "../services/missionSyncService.js";

export const getMissionsSync = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await syncMissionsForUser(prisma, userId);
    return res.json({ success: true, data });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    console.error("getMissionsSync error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
