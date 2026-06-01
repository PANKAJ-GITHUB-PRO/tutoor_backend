import { Schema, model } from "mongoose";
import type { Bid } from "./types.js";

const bidSchema = new Schema<Bid>(
  {
    id: { type: String, required: true, unique: true, index: true },
    requirementId: { type: String, required: true, index: true },
    tutorId: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    note: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },
    createdAt: { type: String, required: true }
  },
  { timestamps: true }
);

bidSchema.index({ requirementId: 1, tutorId: 1 }, { unique: true });

export const BidModel = model<Bid>("Bid", bidSchema);
