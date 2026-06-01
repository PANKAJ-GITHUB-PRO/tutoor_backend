import { Schema, model } from "mongoose";
import type { TutorRequest } from "./types.js";

const requestSchema = new Schema<TutorRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    tutorId: { type: String, required: true, index: true },
    requesterId: { type: String, index: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },
    createdAt: { type: String, required: true }
  },
  { timestamps: true }
);

requestSchema.index({ studentId: 1, tutorId: 1 }, { unique: true });

export const RequestModel = model<TutorRequest>("TutorRequest", requestSchema);
