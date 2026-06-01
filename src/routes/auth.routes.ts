import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { authStartSchema, otpVerifySchema, roleSelectSchema } from "../validations/schemas.js";

export const authRoutes = Router();

authRoutes.post("/start", validate(authStartSchema), authController.start);
authRoutes.post("/verify", validate(otpVerifySchema), authController.verify);
authRoutes.post("/role", requireAuth, validate(roleSelectSchema), authController.role);
