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

// export const getUserProfileController = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const profile = await getUserProfile(userId);

//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     res.json(profile);
//   } catch (err) {
//     console.error("GET PROFILE ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // มาจาก middleware auth
//     const { weight, height, birthDate, activityLevel, gender } = req.body;

//     const profile = await updateUserProfile(userId, {
//       weight,
//       height,
//       birthDate,
//       activityLevel,
//       gender,
//     });

//     res.json(profile);
//   } catch (err) {
//     console.error("UPDATE PROFILE ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const saveFeatures = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { features } = req.body;
//     const user = await updateUserFeatures(userId, features);

//     res.json(user);
//   } catch (err) {
//     console.log("SAVE FEATURES ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // get current user
// export const getUser = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await getUserById(userId);

//     res.json(user);
//   } catch (err) {
//     console.log("GET ME ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// GET /user/profile
export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getUserProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
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
    res.json({ features: features.map(f => f.feature) });
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
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
