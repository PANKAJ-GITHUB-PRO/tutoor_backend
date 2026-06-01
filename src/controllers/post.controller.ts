import type { Request, Response } from "express";
import { bidService } from "../services/bid.service.js";
import { postService } from "../services/post.service.js";
import { ok } from "../utils/http.js";

export const postController = {
  feed: async (req: Request, res: Response) => ok(res, await postService.feed(req.user!, req.query.kind as string | undefined, req.query as Record<string, string | undefined>)),
  mine: async (req: Request, res: Response) => ok(res, await postService.mine(req.user!, req.query.kind as string | undefined, req.query as Record<string, string | undefined>)),
  byUser: async (req: Request<{ id: string }>, res: Response) => ok(res, await postService.byUser(req.user!, req.params.id)),
  create: async (req: Request, res: Response) => ok(res, await postService.create(req.user!, req.body), 201),
  update: async (req: Request<{ id: string }>, res: Response) => ok(res, await postService.update(req.user!, req.params.id, req.body)),
  requirement: async (req: Request<{ id: string }>, res: Response) => {
    const post = await postService.getRequirement(req.user!, req.params.id);
    const bids = await bidService.byRequirement(req.user!, req.params.id);
    const analytics = await bidService.analyticsForRequirement(req.params.id);
    return ok(res, { post, bids, analytics });
  },
  like: async (req: Request<{ id: string }>, res: Response) => ok(res, await postService.like(req.user!, req.params.id)),
  comment: async (req: Request<{ id: string }>, res: Response) => ok(res, await postService.comment(req.user!, req.params.id, req.body.body), 201)
};
