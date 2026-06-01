import { Router } from "express";
import { postController } from "../controllers/post.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { commentCreateSchema, postCreateSchema, postUpdateSchema } from "../validations/schemas.js";

export const postRoutes = Router();

postRoutes.get("/", requireAuth, postController.feed);
postRoutes.get("/mine", requireAuth, postController.mine);
postRoutes.get("/users/:id", requireAuth, postController.byUser);
postRoutes.post("/", requireAuth, validate(postCreateSchema), postController.create);
postRoutes.patch("/:id", requireAuth, validate(postUpdateSchema), postController.update);
postRoutes.post("/:id/like", requireAuth, postController.like);
postRoutes.post("/:id/comments", requireAuth, validate(commentCreateSchema), postController.comment);
postRoutes.get("/requirements/:id", requireAuth, postController.requirement);
