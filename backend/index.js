import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import userRoutes from "./src/routes/userRoutes.js";
import moodRoutes from "./src/routes/moodRoutes.js";
import sleepRoutes from "./src/routes/sleepRoutes.js";
import stepRoutes from "./src/routes/stepRoutes.js";
import gardenRoutes from './src/routes/gardenRoutes.js';
import calorieRoutes from './src/routes/calorieRoutes.js'; // ✅ import อยู่ที่นี่พอ

dotenv.config();

const app = express(); // ✅ ประกาศก่อน

app.use(cors());
app.use(express.json());

// --- Routes ---
app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.use('/api', stepRoutes);
app.use('/api/garden', gardenRoutes);
app.use("/api", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/sleep", sleepRoutes);
app.use('/api/calories', calorieRoutes); // ✅ ย้ายมาไว้ตรงนี้

app.listen(3000, '0.0.0.0', () => {
  console.log("SERVER STARTED ON 3000");
});