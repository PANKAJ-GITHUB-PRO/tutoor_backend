import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { ok } from "../utils/http.js";

export const authController = {
  start: async (req: Request, res: Response) => ok(res, await authService.start(req.body.email, req.body.mode)),
  verify: async (req: Request, res: Response) => ok(res, await authService.verify(req.body.email, req.body.otp, req.body.mode)),
  role: async (req: Request, res: Response) => ok(res, await authService.selectRole(req.user!, req.body.role))
};
