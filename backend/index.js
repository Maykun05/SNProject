import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import userRoutes from "./src/routes/userRoutes.js";
import moodRoutes from "./src/routes/moodRoutes.js";
import sleepRoutes from "./src/routes/sleepRoutes.js";
import foodRoutes from "./src/routes/foodRoutes.js";
import stepRoutes from "./src/routes/stepRoutes.js";
import gardenRoutes from './src/routes/gardenRoutes.js';
import waterRoutes from "./src/routes/waterRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// routes
app.use('/api', stepRoutes);
app.use('/api/garden', gardenRoutes);
app.use("/api", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/water", waterRoutes);

app.listen(3000, '0.0.0.0', () => {
  console.log("SERVER STARTED ON 3000");
});