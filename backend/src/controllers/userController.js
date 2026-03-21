import { registerUser, loginUser, updateUserFeatures, getUserById, updateUserProfile } from "../services/userService.js";

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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight, height, birthDate, activityLevel, gender } = req.body;

    const user = await updateUserProfile(userId, {
      weight,
      height,
      birthDate,
      activityLevel,
      gender,
    });

    res.json(user);
  } catch (err) {
    console.log("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { features } = req.body;
    const user = await updateUserFeatures(userId, features);

    res.json(user);
  } catch (err) {
    console.log("SAVE FEATURES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// get current user
export const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);

    res.json(user);
  } catch (err) {
    console.log("GET ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};