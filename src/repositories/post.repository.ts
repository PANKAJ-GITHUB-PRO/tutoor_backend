import type { Post } from "../models/types.js";
import { PostModel } from "../models/post.model.js";

export const postRepository = {
  all: () => PostModel.find().sort({ createdAt: -1 }).lean<Post[]>().exec(),
  byAuthor: (authorId: string) => PostModel.find({ authorId }).sort({ createdAt: -1 }).lean<Post[]>().exec(),
  findById: (id: string) => PostModel.findOne({ id }).lean<Post>().exec(),
  create: (post: Post) => PostModel.create(post).then((doc) => doc.toObject() as Post),
  update: (id: string, patch: Partial<Post>) =>
    PostModel.findOneAndUpdate({ id }, patch, { new: true }).lean<Post>().exec()
};
