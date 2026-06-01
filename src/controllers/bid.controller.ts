import type { Request, Response } from "express";
import { bidService } from "../services/bid.service.js";
import { ok } from "../utils/http.js";

export const bidController = {
  list: async (req: Request, res: Response) => ok(res, await bidService.list(req.user!, req.query as Record<string, string | undefined>)),
  get: async (req: Request<{ id: string }>, res: Response) => ok(res, await bidService.get(req.user!, req.params.id)),
  create: async (req: Request<{ id: string }>, res: Response) => ok(res, await bidService.create(req.user!, req.params.id, req.body.price, req.body.note), 201),
  status: async (req: Request<{ id: string }>, res: Response) => ok(res, await bidService.updateStatus(req.user!, req.params.id, req.body.status))
};
