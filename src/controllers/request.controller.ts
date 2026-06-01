import type { Request, Response } from "express";
import { requestService } from "../services/request.service.js";
import { ok } from "../utils/http.js";

export const requestController = {
  list: async (req: Request, res: Response) => ok(res, await requestService.list(req.user!, req.query as Record<string, string | undefined>)),
  create: async (req: Request<{ tutorId: string }>, res: Response) => ok(res, await requestService.create(req.user!, req.params.tutorId), 201),
  createForStudent: async (req: Request<{ studentId: string }>, res: Response) => ok(res, await requestService.createForStudent(req.user!, req.params.studentId), 201),
  status: async (req: Request<{ id: string }>, res: Response) => ok(res, await requestService.updateStatus(req.user!, req.params.id, req.body.status))
};
