import * as userService from "../services/userService.js";
import { getUserFeatures, updateUserFeatures, getUserFeatureIds } from "../services/featureService.js";
import prisma from "../config/prisma.js";
import { isTreeTypeUnlocked } from "../services/treeGardenService.js";

export const register = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/user
export const getUserController = async (req, res) => {
  try {
    const userId = req.user.id; // ดึงจาก token
    const user = await userService.getUser(userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลไม่สำเร็จ" });
  }
};

// PUT /api/user
export const updateUserController = async (req, res) => {
  try {
    const userId = req.user.id; // ดึงจาก token
    const { username, email, password } = req.body;
    const updated = await userService.updateUser(userId, { username, email, password });
    res.json({ message: "อัปเดตสำเร็จ", user: updated });
  } catch (err) {
    res.status(500).json({ message: "อัปเดตไม่สำเร็จ" });
  }
};

// GET /user/profile
export const getProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'โหลดโปรไฟล์ไม่สำเร็จ' });
  }
};

// PUT /user/profile
export const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await userService.updateUserProfile(userId, req.body);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /user/features
export const getFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const features = await getUserFeatures(userId);

    const result = {};

    features.forEach((f) => {
      const name = f.feature.name;
      const key = name.replace("Feature", "").toLowerCase();

      result[key] = true;
    });

    res.json(result); // ✅ ส่ง object
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// POST /user/features
export const saveFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { features } = req.body;

    const updated = await updateUserFeatures(userId, features);

    const result = {};
    updated.forEach((uf) => {
      const name = uf.feature.name;
      const key = name.replace("Feature", "").toLowerCase();
      result[key] = true;
    });

    res.json(result);
  } catch (err) {
    console.error("SAVE FEATURES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /api/user/xp/apply — body: { amount: number } */
export const applyXpController = async (req, res) => {
  try {
    const userId = req.user.id;
    const next = await userService.applyXpGrant(userId, req.body?.amount);
    return res.json({ success: true, data: next });
  } catch (err) {
    if (err.message === "Invalid amount" || err.message === "Amount too large") {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error("applyXpController error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

 // GET /user/profile
export const getUserProfileController = async (req, res) => {
  try {
    // สมมติว่ามี middleware auth ที่ set req.user.id จาก token
    const userId = req.user.id;

    const user = await userService.getUserWithProfile(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// GET /user/profile/stats
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await userService.getProfileStatsService(userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
 
export const getFeatureIds = async (req, res) => { //เอาไว้แก้ไขฟีเจ้อหน้าโฮม
  try {
    const userId = req.user.id;

    const ids = await getUserFeatureIds(userId);

    res.json(ids); // 👈 [1,3,5]

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET tree type
export const getTreeType = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    return res.json({ success: true, selectedTreeType: profile?.selectedTreeType ?? 1 });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** สอดคล้อง seed TreeType — ใช้เมื่อยังไม่มีแถวใน DB (แอปใช้ fallback แต่ PUT มาได้) */
const TREE_TYPE_FALLBACK = {
  1: { id: 1, unlockCoinCost: 0 },
  2: { id: 2, unlockCoinCost: 200 },
  3: { id: 3, unlockCoinCost: 350 },
  4: { id: 4, unlockCoinCost: 500 },
  5: { id: 5, unlockCoinCost: 700 },
};

// ✅ PUT tree type
export const updateTreeType = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedTreeType = Number(req.body?.selectedTreeType);

    if (!Number.isInteger(selectedTreeType) || selectedTreeType < 1 || selectedTreeType > 5) {
      return res.status(400).json({ success: false, message: "Invalid tree type" });
    }

    let treeType = await prisma.treeType.findUnique({ where: { id: selectedTreeType } });
    if (!treeType) {
      treeType = TREE_TYPE_FALLBACK[selectedTreeType];
    }
    if (!treeType) {
      return res.status(400).json({ success: false, message: "Unknown tree type" });
    }
    if (!(await isTreeTypeUnlocked(userId, treeType))) {
      return res.status(403).json({ success: false, message: "Tree type not unlocked" });
    }

    await prisma.profile.upsert({
      where: { userId },
      update: { selectedTreeType },
      create: { userId, selectedTreeType },
    });

    return res.json({ success: true, selectedTreeType });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};