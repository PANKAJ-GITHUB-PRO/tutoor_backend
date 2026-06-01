import { Router } from "express";
import { bidController } from "../controllers/bid.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { bidCreateSchema, statusSchema } from "../validations/schemas.js";

export const bidRoutes = Router();

bidRoutes.get("/", requireAuth, bidController.list);
bidRoutes.get("/:id", requireAuth, bidController.get);
bidRoutes.post("/requirements/:id", requireAuth, validate(bidCreateSchema), bidController.create);
bidRoutes.patch("/:id/status", requireAuth, validate(statusSchema), bidController.status);
