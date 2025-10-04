// import express from"express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import authRoutes from "./routes/auth.routes.js";

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(cookieParser());

// app.get("/", (req, res) => {
//     res.send("welcome to CoffeeLab");
// })


// app.use("api/v1/auth", authRoutes);


// app.listen(process.env.PORT, () => {
//     console.log("server is running")
// })

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoutes)


app.use("api/v1/playlist", playlistRoutes)
// Server
const PORT = process.env.PORT || 9090;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

