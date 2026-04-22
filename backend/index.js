import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import userRoutes from "./src/routes/userRoutes.js";
import moodRoutes from "./src/routes/moodRoutes.js";
import sleepRoutes from "./src/routes/sleepRoutes.js";
import foodRoutes from "./src/routes/foodRoutes.js";
import activitySessionRoutes from "./src/routes/activitySessionRoutes.js";
import dailyProgressRoutes from "./src/routes/dailyProgressRoutes.js";
import homeTreesRoutes from "./src/routes/homeTreesRoutes.js";
import exerciseRoutes from "./src/routes/exerciseRoutes.js";
import waterRoutes from "./src/routes/waterRoutes.js";
import statsRoutes from "./src/routes/statsRoutes.js";
import missionRoutes from "./src/routes/missionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// routes
app.use('/api', activitySessionRoutes);
app.use("/api/daily-progress", dailyProgressRoutes);
app.use("/api/home-trees", homeTreesRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api", missionRoutes);

app.listen(3000, '0.0.0.0', () => {
  console.log("SERVER STARTED ON 3000");
});