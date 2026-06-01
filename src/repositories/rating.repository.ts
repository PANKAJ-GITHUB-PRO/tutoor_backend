import type { Rating } from "../models/types.js";
import { RatingModel } from "../models/rating.model.js";

export const ratingRepository = {
  byTutor: (tutorId: string) => RatingModel.find({ tutorId }).sort({ createdAt: -1 }).lean<Rating[]>().exec(),
  findByPair: (tutorId: string, studentId: string) =>
    RatingModel.findOne({ tutorId, studentId }).lean<Rating>().exec(),
  create: (rating: Rating) => RatingModel.create(rating).then(() => rating)
};
