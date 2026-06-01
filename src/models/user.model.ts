import { Schema, model } from "mongoose";
import type { User } from "./types.js";

const locationSchema = new Schema(
  {
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const userSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "tutor"], required: true },
    onboarded: { type: Boolean, default: false },
    avatar: { type: String, required: true },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    location: { type: locationSchema, required: true },
    education: String,
    customEducation: String,
    grade: String,
    headline: String,
    bio: String,
    skills: { type: [String], default: [] },
    subjects: { type: [String], default: [] },
    modes: { type: [String], enum: ["online", "one-to-one", "group", "home"], default: [] },
    experienceYears: { type: Number, default: 0 },
    pricePerHour: { type: Number, default: 0 },
    minimumFee: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    kycStatus: { type: String, enum: ["pending", "verified"] }
  },
  { timestamps: true }
);

export const UserModel = model<User>("User", userSchema);
