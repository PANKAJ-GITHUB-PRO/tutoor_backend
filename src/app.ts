import cors from "cors";
import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { bidRoutes } from "./routes/bid.routes.js";
import { postRoutes } from "./routes/post.routes.js";
import { requestRoutes } from "./routes/request.routes.js";
import { userRoutes } from "./routes/user.routes.js";

export const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "tutor-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/requests", requestRoutes);
app.use(errorMiddleware);
