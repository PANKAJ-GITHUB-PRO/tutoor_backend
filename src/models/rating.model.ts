import { Schema, model } from "mongoose";
import type { Rating } from "./types.js";

const ratingSchema = new Schema<Rating>(
  {
    id: { type: String, required: true, unique: true, index: true },
    tutorId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    review: String,
    createdAt: { type: String, required: true }
  },
  { timestamps: true }
);

ratingSchema.index({ tutorId: 1, studentId: 1 }, { unique: true });

export const RatingModel = model<Rating>("Rating", ratingSchema);
