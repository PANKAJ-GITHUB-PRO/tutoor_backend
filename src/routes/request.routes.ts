import { Router } from "express";
import { requestController } from "../controllers/request.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { statusSchema } from "../validations/schemas.js";

export const requestRoutes = Router();

requestRoutes.get("/", requireAuth, requestController.list);
requestRoutes.post("/tutors/:tutorId", requireAuth, requestController.create);
requestRoutes.post("/students/:studentId", requireAuth, requestController.createForStudent);
requestRoutes.patch("/:id/status", requireAuth, validate(statusSchema), requestController.status);
