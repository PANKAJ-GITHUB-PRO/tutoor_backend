import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role, User } from "../models/types.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/http.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "tutor-dev-secret";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function signToken(user: User) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "30d" });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "Authentication required");
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await userRepository.findById(decoded.sub);
    if (!user) throw new ApiError(401, "Invalid session");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) throw new ApiError(403, "Not allowed");
    next();
  };
}
