
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./src/routes/userRoutes.js";
import moodRoutes from "./src/routes/moodRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// routes
app.use("/api", userRoutes);
app.use("/api/mood", moodRoutes);


app.listen(3000,'0.0.0.0',() => {
  console.log("SERVER STARTED ON 3000");
});