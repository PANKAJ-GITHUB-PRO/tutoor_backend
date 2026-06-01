import type { User } from "../models/types.js";
import { bidRepository } from "../repositories/bid.repository.js";
import { postRepository } from "../repositories/post.repository.js";
import { ApiError, id } from "../utils/http.js";
import { nowIso } from "../utils/time.js";
import { paginate, type PageQuery } from "../utils/pagination.js";
import { toBidDto, enrichBidAnalytics } from "./mapper.service.js";

function filterBySection(bids: Awaited<ReturnType<typeof bidRepository.all>>, section?: string) {
  if (!section || section === "all") return bids;
  if (section === "requests") return bids.filter((bid) => bid.status === "pending");
  if (section === "history") return bids.filter((bid) => bid.status === "accepted" || bid.status === "rejected");
  return bids.filter((bid) => bid.status === section);
}

export const bidService = {
  list: async (user: User, pageQuery?: PageQuery & { section?: string }) => {
    let bids: Awaited<ReturnType<typeof bidRepository.all>>;
    if (user.role === "student") {
      const ownedRequirements = (await postRepository.all())
        .filter((p) => p.authorId === user.id && p.kind === "requirement")
        .map((p) => p.id);
      bids = (await bidRepository.all()).filter((b) => ownedRequirements.includes(b.requirementId));
    } else {
      bids = await bidRepository.byTutor(user.id);
    }

    bids = filterBySection(bids, pageQuery?.section);
    if (!pageQuery?.page) return Promise.all(bids.map(toBidDto));
    const page = paginate(bids, pageQuery);
    return { ...page, items: await Promise.all(page.items.map(toBidDto)) };
  },
  byRequirement: async (user: User, requirementId: string) => {
    const post = await postRepository.findById(requirementId);
    if (!post || post.kind !== "requirement") throw new ApiError(404, "Requirement not found");
    const bids = await bidRepository.byRequirement(requirementId);
    if (post.authorId === user.id) return Promise.all(bids.map(toBidDto));
    if (user.role === "tutor") return Promise.all(bids.filter((b) => b.tutorId === user.id).map(toBidDto));
    return [];
  },
  create: async (user: User, requirementId: string, price: number, note: string) => {
    if (user.role !== "tutor") throw new ApiError(403, "Only tutors can bid");
    const post = await postRepository.findById(requirementId);
    if (!post || post.kind !== "requirement" || post.authorRole !== "student") throw new ApiError(400, "Bids are allowed only on student requirement posts");
    const existingBid = (await bidRepository.byRequirement(requirementId)).find((bid) => bid.tutorId === user.id);
    if (existingBid) return toBidDto(existingBid);
    if (post.status !== "active") throw new ApiError(400, "This requirement is closed and no longer accepts new bids");
    return toBidDto(await bidRepository.create({ id: id("b"), requirementId, tutorId: user.id, price, note, status: "pending", createdAt: nowIso() }));
  },
  updateStatus: async (user: User, bidId: string, status: "accepted" | "rejected") => {
    const bid = await bidRepository.findById(bidId);
    if (!bid) throw new ApiError(404, "Bid not found");
    const post = await postRepository.findById(bid.requirementId);
    if (!post || post.authorId !== user.id) throw new ApiError(403, "Only the requirement owner can update this bid");
    if (status === "accepted") await postRepository.update(post.id, { status: "completed" });
    return toBidDto((await bidRepository.update(bidId, { status }))!);
  },
  get: async (user: User, bidId: string) => {
    const bid = await bidRepository.findById(bidId);
    if (!bid) throw new ApiError(404, "Bid not found");
    const post = await postRepository.findById(bid.requirementId);
    if (!post) throw new ApiError(404, "Requirement not found");
    const allowed = post.authorId === user.id || bid.tutorId === user.id;
    if (!allowed) throw new ApiError(403, "Not allowed to view this bid");
    return toBidDto(bid);
  },
  analyticsForRequirement: async (requirementId: string) => {
    const bids = await bidRepository.byRequirement(requirementId);
    return enrichBidAnalytics(bids);
  }
};
