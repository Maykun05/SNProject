// import {createUserService,getUsersService,} from "../services/userService.js";
// import bcrypt from "bcrypt";

// const isMatch = await bcrypt.compare(password, user.password);
// export const createUser = async (req, res) => {
//   try {
//     const user = await createUserService(req.body);
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getUsers = async (req, res) => {
//   try {
//     const users = await getUsersService();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../services/userService.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ❌ email ซ้ำ
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ สร้าง user (hash อยู่ใน service)
    const user = await createUser({ username, email, password });

    // 🔥 สร้าง token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 หา user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔥 เช็ค password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // 🔑 สร้าง token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};