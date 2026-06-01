import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { profileSchema, ratingCreateSchema } from "../validations/schemas.js";

export const userRoutes = Router();

userRoutes.get("/me", requireAuth, userController.me);
userRoutes.get("/me/stats", requireAuth, userController.stats);
userRoutes.patch("/me", requireAuth, validate(profileSchema), userController.updateMe);
userRoutes.get("/tutors", requireAuth, userController.tutors);
userRoutes.get("/students", requireAuth, userController.students);
userRoutes.get("/tutors/:id", requireAuth, userController.tutor);
userRoutes.post("/tutors/:id/ratings", requireAuth, validate(ratingCreateSchema), userController.rateTutor);
userRoutes.get("/profiles/:id", requireAuth, userController.profile);
userRoutes.get("/locations", userController.locations);
userRoutes.get("/locations/states", userController.states);
userRoutes.get("/locations/cities", userController.cities);
userRoutes.get("/locations/pincodes", userController.pincodes);
userRoutes.get("/subjects", userController.subjects);
