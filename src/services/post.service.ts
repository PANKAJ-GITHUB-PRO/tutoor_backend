import type { Post, User } from "../models/types.js";
import { postRepository } from "../repositories/post.repository.js";
import { ApiError, id } from "../utils/http.js";
import { nowIso } from "../utils/time.js";
import { paginate, type PageQuery } from "../utils/pagination.js";
import { toPostDto } from "./mapper.service.js";

export const postService = {
  feed: async (user: User, kind?: string, pageQuery?: PageQuery) => {
    const posts = (await postRepository.all())
      .filter((p) => visibleTo(p, user))
      .filter((p) => !kind || kind === "all" || p.kind === kind);
    if (!pageQuery?.page) return Promise.all(posts.map((p) => toPostDto(p, user)));
    const page = paginate(posts, pageQuery);
    return { ...page, items: await Promise.all(page.items.map((p) => toPostDto(p, user))) };
  },
  mine: async (user: User, kind?: string, pageQuery?: PageQuery) => {
    const posts = (await postRepository.byAuthor(user.id))
      .filter((p) => !kind || kind === "all" || p.kind === kind);
    if (!pageQuery?.page) return Promise.all(posts.map((p) => toPostDto(p, user)));
    const page = paginate(posts, pageQuery);
    return { ...page, items: await Promise.all(page.items.map((p) => toPostDto(p, user))) };
  },
  byUser: async (viewer: User, userId: string) => {
    const posts = (await postRepository.byAuthor(userId)).filter((p) => visibleTo(p, viewer) || p.authorId === viewer.id);
    return Promise.all(posts.map((p) => toPostDto(p, viewer)));
  },
  create: async (user: User, input: Omit<Post, "id" | "authorId" | "authorRole" | "createdAt" | "likes" | "comments">) => {
    if (user.role === "student" && input.kind === "announcement") throw new ApiError(403, "Only tutors can create announcement posts");
    if (user.role === "tutor" && input.kind === "requirement") throw new ApiError(403, "Only students can create requirement posts");
    if (user.role === "tutor" && input.kind === "announcement" && !input.title) throw new ApiError(400, "Announcement title is required");
    const post = await postRepository.create({
      ...input,
      id: id("p"),
      authorId: user.id,
      authorRole: user.role,
      location: input.location ?? user.location,
      status: "active",
      createdAt: nowIso(),
      likes: [],
      comments: []
    });
    return toPostDto(post, user);
  },
  update: async (user: User, idValue: string, patch: Partial<Post>) => {
    const post = await postRepository.findById(idValue);
    if (!post) throw new ApiError(404, "Post not found");
    if (post.authorId !== user.id) throw new ApiError(403, "Only the post owner can edit this post");
    if (user.role === "student" && patch.kind === "announcement") throw new ApiError(403, "Only tutors can create announcement posts");
    if (user.role === "tutor" && patch.kind === "requirement") throw new ApiError(403, "Only students can create requirement posts");
    const updated = await postRepository.update(idValue, patch);
    return toPostDto(updated!, user);
  },
  getRequirement: async (user: User, idValue: string) => {
    const post = await postRepository.findById(idValue);
    if (!post || post.kind !== "requirement") throw new ApiError(404, "Requirement not found");
    const canView = post.authorId === user.id || (user.role === "tutor" && post.authorRole === "student");
    if (!canView) throw new ApiError(403, "Requirement not available");
    return toPostDto(post, user);
  },
  like: async (user: User, idValue: string) => {
    const post = await postRepository.findById(idValue);
    if (!post) throw new ApiError(404, "Post not found");
    if (!visibleTo(post, user) && post.authorId !== user.id) throw new ApiError(403, "Post not available");
    const likes = post.likes.includes(user.id) ? post.likes.filter((x) => x !== user.id) : [...post.likes, user.id];
    const updated = await postRepository.update(idValue, { likes });
    return toPostDto(updated!, user);
  },
  comment: async (user: User, idValue: string, body: string) => {
    const post = await postRepository.findById(idValue);
    if (!post) throw new ApiError(404, "Post not found");
    if (!visibleTo(post, user) && post.authorId !== user.id) throw new ApiError(403, "Post not available");
    const comments = [{ id: id("c"), authorId: user.id, body, createdAt: nowIso() }, ...post.comments];
    const updated = await postRepository.update(idValue, { comments });
    return toPostDto(updated!, user);
  }
};

function visibleTo(post: Post, user: User) {
  if (!user || !post.kind) return false;
  if (post.kind === "requirement") {
    return user.role === "tutor" && post.authorRole === "student";
  }
  return post.kind === "general" || post.kind === "announcement";
}
