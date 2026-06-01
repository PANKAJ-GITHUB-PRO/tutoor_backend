import { Schema, model } from "mongoose";
import type { Comment, Post } from "./types.js";

const locationSchema = new Schema(
  {
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const commentSchema = new Schema<Comment>(
  {
    id: { type: String, required: true },
    authorId: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: String, required: true }
  },
  { _id: false }
);

const postSchema = new Schema<Post>(
  {
    id: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: ["general", "announcement", "requirement"], required: true, index: true },
    authorId: { type: String, required: true, index: true },
    authorRole: { type: String, enum: ["student", "tutor"], required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: { type: [String], default: [] },
    budget: String,
    mode: { type: String, enum: ["online", "one-to-one", "group", "home"] },
    location: locationSchema,
    status: { type: String, enum: ["active", "completed", "expired"], default: "active", index: true },
    createdAt: { type: String, required: true },
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] }
  },
  { timestamps: true }
);

export const PostModel = model<Post>("Post", postSchema);
