import type { User } from "../models/types.js";
import { bidRepository } from "../repositories/bid.repository.js";
import { postRepository } from "../repositories/post.repository.js";
import { requestRepository } from "../repositories/request.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ratingRepository } from "../repositories/rating.repository.js";
import { ApiError } from "../utils/http.js";
import { nowIso } from "../utils/time.js";
import { paginate } from "../utils/pagination.js";
import { hasContactUnlock, toSafeUser } from "./mapper.service.js";

async function tutorRatingSummary(tutorId: string) {
  const ratings = await ratingRepository.byTutor(tutorId);
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const item of ratings) breakdown[item.stars as 1 | 2 | 3 | 4 | 5] += 1;
  const ratingTotal = ratings.length;
  const rating = ratingTotal ? ratings.reduce((sum, item) => sum + item.stars, 0) / ratingTotal : 0;
  return {
    rating: Number(rating.toFixed(2)),
    reviews: ratingTotal,
    ratingTotal,
    ratingBreakdown: breakdown
  };
}

export const userService = {
  me: (user: User) => toSafeUser(user, user),
  stats: async (user: User) => {
    const [posts, requests, allBids, allPosts] = await Promise.all([
      postRepository.byAuthor(user.id),
      user.role === "tutor" ? requestRepository.byTutor(user.id) : requestRepository.byStudent(user.id),
      bidRepository.all(),
      postRepository.all()
    ]);
    const ownRequirementIds = new Set(posts.filter((post) => post.kind === "requirement").map((post) => post.id));
    const requirementAuthorById = new Map(allPosts.map((post) => [post.id, post.authorId]));
    const incomingRequests = requests.filter((request) => {
      const requesterId = request.requesterId ?? request.studentId;
      const approverId = requesterId === request.studentId ? request.tutorId : request.studentId;
      return approverId === user.id;
    });
    const sentPending = requests.filter((request) => {
      const senderId = request.requesterId ?? request.studentId;
      return senderId === user.id && request.status === "pending";
    }).length;
    const pendingIncoming = incomingRequests.filter((request) => request.status === "pending").length;
    const acceptedRequestConnections = requests
      .filter((request) => request.status === "accepted")
      .map((request) => user.role === "tutor" ? request.studentId : request.tutorId);
    const acceptedBidConnections = user.role === "tutor"
      ? allBids.filter((bid) => bid.tutorId === user.id && bid.status === "accepted").map((bid) => requirementAuthorById.get(bid.requirementId)).filter((id): id is string => Boolean(id))
      : allBids.filter((bid) => ownRequirementIds.has(bid.requirementId) && bid.status === "accepted").map((bid) => bid.tutorId);
    const connectionIds = new Set([...acceptedRequestConnections, ...acceptedBidConnections]);
    return {
      posts: posts.length,
      requests: pendingIncoming,
      sentRequests: sentPending,
      bids: user.role === "tutor" ? allBids.filter((bid) => bid.tutorId === user.id).length : allBids.filter((bid) => ownRequirementIds.has(bid.requirementId)).length,
      connections: connectionIds.size,
      rating: user.role === "tutor" ? user.rating : null,
      reviews: user.role === "tutor" ? user.reviews : null
    };
  },
  updateMe: async (user: User, patch: Partial<User>) => {
    const updated = await userRepository.update(user.id, { ...patch, onboarded: true });
    if (!updated) throw new ApiError(404, "Profile not found");
    return toSafeUser(updated, updated);
  },
  getTutor: async (id: string, viewer?: User) => {
    const tutor = await userRepository.findById(id);
    if (!tutor || tutor.role !== "tutor") throw new ApiError(404, "Tutor not found");
    const [safe, ratingSummary, myRating] = await Promise.all([
      toSafeUser(tutor, viewer),
      tutorRatingSummary(id),
      viewer?.role === "student" ? ratingRepository.findByPair(id, viewer.id) : Promise.resolve(null)
    ]);
    return {
      ...safe,
      ...ratingSummary,
      myRating: myRating ? { stars: myRating.stars, review: myRating.review ?? "", createdAt: myRating.createdAt } : null
    };
  },
  profile: async (id: string, viewer?: User) => {
    const user = await userRepository.findById(id);
    if (!user) throw new ApiError(404, "Profile not found");
    const safe = await toSafeUser(user, viewer);
    if (user.role !== "tutor") {
      return { ...safe, rating: 0, reviews: 0, ratingBreakdown: null, ratingTotal: 0 };
    }
    const ratingSummary = await tutorRatingSummary(id);
    return { ...safe, ...ratingSummary };
  },
  searchTutors: async (query: Record<string, string | undefined>, viewer?: User) => {
    const q = query.q?.toLowerCase();
    const offlineModes = ["one-to-one", "group", "home"];
    const matchesMode = (tutor: User) => {
      if (!query.mode || query.mode === "all") return true;
      if (query.mode === "offline") return tutor.modes.some((mode) => offlineModes.includes(mode));
      return tutor.modes.includes(query.mode as User["modes"][number]);
    };
    const tutors = (await userRepository.byRole("tutor"))
      .filter((t) => !q || `${t.name} ${t.headline} ${t.subjects.join(" ")} ${t.skills.join(" ")} ${t.education} ${t.customEducation ?? ""}`.toLowerCase().includes(q))
      .filter((t) => !query.subject || t.subjects.some((s) => s.toLowerCase() === query.subject!.toLowerCase() || s.toLowerCase().includes(query.subject!.toLowerCase())))
      .filter((t) => !query.skill || t.skills.some((s) => s.toLowerCase().includes(query.skill!.toLowerCase())))
      .filter((t) => !query.education || `${t.education} ${t.customEducation ?? ""}`.toLowerCase().includes(query.education.toLowerCase()))
      .filter((t) => !query.minExperience || t.experienceYears >= Number(query.minExperience))
      .filter((t) => !query.minRating || t.rating >= Number(query.minRating))
      .filter((t) => !query.minPrice || t.pricePerHour >= Number(query.minPrice))
      .filter((t) => !query.maxPrice || t.pricePerHour <= Number(query.maxPrice))
      .filter((t) => !query.state || t.location.state === query.state)
      .filter((t) => !query.district || t.location.district === query.district)
      .filter((t) => !query.city || t.location.city === query.city || t.location.district === query.city)
      .filter((t) => !query.pincode || t.location.pincode === query.pincode)
      .filter(matchesMode)
      .filter((t) => !query.topRated || t.rating >= 4.8);
    if (query.sort === "rating") tutors.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    if (query.sort === "price") tutors.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (!query.page) return Promise.all(tutors.map((t) => toSafeUser(t, viewer)));
    const page = paginate(tutors, query);
    return { ...page, items: await Promise.all(page.items.map((t) => toSafeUser(t, viewer))) };
  },
  searchStudents: async (query: Record<string, string | undefined>, viewer?: User) => {
    const q = query.q?.toLowerCase();
    const students = (await userRepository.byRole("student"))
      .filter((student) => student.id !== viewer?.id)
      .filter((student) => !q || `${student.name} ${student.grade} ${student.education}`.toLowerCase().includes(q))
      .filter((student) => !query.state || student.location.state === query.state)
      .filter((student) => !query.city || student.location.city === query.city || student.location.district === query.city)
      .filter((student) => !query.pincode || student.location.pincode === query.pincode);
    if (!query.page) return Promise.all(students.map((student) => toSafeUser(student, viewer)));
    const page = paginate(students, query);
    return { ...page, items: await Promise.all(page.items.map((student) => toSafeUser(student, viewer))) };
  },
  rateTutor: async (user: User, tutorId: string, stars: number, review?: string) => {
    if (user.role !== "student") throw new ApiError(403, "Only students can rate tutors");
    const tutor = await userRepository.findById(tutorId);
    if (!tutor || tutor.role !== "tutor") throw new ApiError(404, "Tutor not found");
    if (!(await hasContactUnlock(user, tutorId))) throw new ApiError(403, "You can rate only connected tutors");
    const existing = await ratingRepository.findByPair(tutorId, user.id);
    if (existing) throw new ApiError(409, "You have already rated this tutor");
    await ratingRepository.create({ id: `${tutorId}_${user.id}`, tutorId, studentId: user.id, stars, review, createdAt: nowIso() });
    const ratings = await ratingRepository.byTutor(tutorId);
    const rating = ratings.length ? ratings.reduce((sum, item) => sum + item.stars, 0) / ratings.length : 0;
    const updated = await userRepository.update(tutorId, { rating: Number(rating.toFixed(2)), reviews: ratings.length });
    const [safe, ratingSummary, myRating] = await Promise.all([
      toSafeUser(updated!, user),
      tutorRatingSummary(tutorId),
      ratingRepository.findByPair(tutorId, user.id)
    ]);
    return {
      ...safe,
      ...ratingSummary,
      myRating: myRating ? { stars: myRating.stars, review: myRating.review ?? "", createdAt: myRating.createdAt } : null
    };
  }
};
