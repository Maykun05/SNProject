// import express from "express"
// import cors from "cors"
// import dotenv from "dotenv"
// import userRoutes from "./src/routes/userRoutes.js";
// import moodRoutes from "./src/routes/moodRoutes.js";

// dotenv.config()

// const app = express()

// app.use(cors())
// app.use(express.json())

// app.use("/api", userRoutes)
// app.use("/api", moodRoutes)

// app.listen(process.env.PORT || 3000, ()=>{
//   console.log("server running")
// })
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
app.use("/api", moodRoutes);

app.listen(3000, () => {
  console.log("SERVER STARTED ON 3000");
});