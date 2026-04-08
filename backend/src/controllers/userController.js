import { registerUser, loginUser, getUserProfile, updateUserProfile, getProfileStatsService } from "../services/userService.js";
import { getUserFeatures, updateUserFeatures, getUserFeatureIds } from "../services/featureService.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /user/profile
export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getUserProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error("SAVE FEATURES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /user/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await updateUserProfile(userId, req.body);
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

      // 🔥 ตัดคำว่า "Feature" ออก
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

// GET /user/profile/stats
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getProfileStatsService(userId);
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

// ✅ PUT tree type
export const updateTreeType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedTreeType } = req.body;

    if (selectedTreeType < 1 || selectedTreeType > 5) {
      return res.status(400).json({ success: false, message: 'Invalid tree type' });
    }

    await prisma.profile.upsert({
      where: { userId },
      update: { selectedTreeType },
      create: { userId, selectedTreeType },
    });

    return res.json({ success: true, selectedTreeType });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};