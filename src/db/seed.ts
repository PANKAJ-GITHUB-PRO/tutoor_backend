import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AnyBulkWriteOperation } from "mongoose";
import { BidModel } from "../models/bid.model.js";
import { PostModel } from "../models/post.model.js";
import { RequestModel } from "../models/request.model.js";
import { RatingModel } from "../models/rating.model.js";
import type { Bid, Post, Rating, TutorRequest, User } from "../models/types.js";
import { UserModel } from "../models/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.resolve(__dirname, "../../seed");

async function readSeedFile<T>(fileName: string): Promise<T[]> {
  const file = await readFile(path.join(seedDir, fileName), "utf8");
  return JSON.parse(file) as T[];
}

async function upsertMany<T extends { id: string }>(
  model: { bulkWrite: (...args: any[]) => Promise<unknown> },
  items: T[]
) {
  if (!items.length) return;
  const operations: AnyBulkWriteOperation<T>[] = items.map((item) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: item },
      upsert: true
    }
  }));

  await model.bulkWrite(
    operations
  );
}

export async function seedDatabase({ force = false } = {}) {
  const userCount = await UserModel.estimatedDocumentCount();
  if (userCount > 0 && !force) return { skipped: true, reason: "Database already has users" };

  const [users, posts, bids, requests, ratings] = await Promise.all([
    readSeedFile<User>("users.json"),
    readSeedFile<Post>("posts.json"),
    readSeedFile<Bid>("bids.json"),
    readSeedFile<TutorRequest>("requests.json"),
    readSeedFile<Rating>("ratings.json")
  ]);

  await upsertMany(UserModel, users);
  await upsertMany(PostModel, posts);
  await upsertMany(BidModel, bids);
  await upsertMany(RequestModel, requests);
  await upsertMany(RatingModel, ratings);

  return {
    skipped: false,
    users: users.length,
    posts: posts.length,
    bids: bids.length,
    requests: requests.length,
    ratings: ratings.length
  };
}
