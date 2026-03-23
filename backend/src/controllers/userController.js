import { registerUser, loginUser, getUserProfile, updateUserProfile } from "../services/userService.js";
import { getUserFeatures, updateUserFeatures } from "../services/featureService.js";

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
