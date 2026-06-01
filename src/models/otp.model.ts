import { Schema, model } from "mongoose";
import type { OtpCode } from "./types.js";

const otpSchema = new Schema<OtpCode>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    mode: { type: String, enum: ["login", "register"], required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    consumedAt: { type: Date },
    attempts: { type: Number, default: 0 },
    createdAt: { type: String, required: true }
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, mode: 1, consumedAt: 1, createdAt: -1 });

export const OtpModel = model<OtpCode>("OtpCode", otpSchema);
