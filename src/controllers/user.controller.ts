import type { Request, Response } from "express";
import { INDIA_LOCATIONS, SUBJECTS } from "../constants/location.js";
import { locationService } from "../services/location.service.js";
import { userService } from "../services/user.service.js";
import { ok } from "../utils/http.js";

export const userController = {
  me: async (req: Request, res: Response) => ok(res, await userService.me(req.user!)),
  stats: async (req: Request, res: Response) => ok(res, await userService.stats(req.user!)),
  updateMe: async (req: Request, res: Response) => ok(res, await userService.updateMe(req.user!, req.body)),
  tutor: async (req: Request<{ id: string }>, res: Response) => ok(res, await userService.getTutor(req.params.id, req.user)),
  profile: async (req: Request<{ id: string }>, res: Response) => ok(res, await userService.profile(req.params.id, req.user)),
  tutors: async (req: Request, res: Response) => ok(res, await userService.searchTutors(req.query as Record<string, string | undefined>, req.user)),
  students: async (req: Request, res: Response) => ok(res, await userService.searchStudents(req.query as Record<string, string | undefined>, req.user)),
  rateTutor: async (req: Request<{ id: string }>, res: Response) => ok(res, await userService.rateTutor(req.user!, req.params.id, req.body.stars, req.body.review)),
  locations: (_req: Request, res: Response) => ok(res, INDIA_LOCATIONS),
  states: async (_req: Request, res: Response) => ok(res, await locationService.states()),
  cities: async (req: Request, res: Response) => ok(res, await locationService.cities(String(req.query.state ?? ""))),
  pincodes: async (req: Request, res: Response) => ok(res, await locationService.pincodes(String(req.query.city ?? ""), req.query.state ? String(req.query.state) : undefined)),
  subjects: (_req: Request, res: Response) => ok(res, SUBJECTS)
};
