import type { Bid, Post, User } from "../models/types.js";
import { bidRepository } from "../repositories/bid.repository.js";
import { postRepository } from "../repositories/post.repository.js";
import { requestRepository } from "../repositories/request.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export async function hasContactUnlock(viewer: User, otherId: string) {
  const [requests, bids] = await Promise.all([
    requestRepository.all(),
    bidRepository.all()
  ]);
  return requests.some((r) =>
    ((r.studentId === viewer.id && r.tutorId === otherId) || (r.studentId === otherId && r.tutorId === viewer.id)) &&
    r.status === "accepted"
  ) || (await Promise.all(bids.map(async (b) => {
    if (b.status !== "accepted") return false;
    const post = await postRepository.findById(b.requirementId);
    return Boolean(post && post.authorId === viewer.id && b.tutorId === otherId);
  }))).some(Boolean) || (await Promise.all(bids.map(async (b) => {
    if (b.status !== "accepted") return false;
    const post = await postRepository.findById(b.requirementId);
    return Boolean(post && post.authorId === otherId && b.tutorId === viewer.id);
  }))).some(Boolean);
}

export async function toSafeUser(user: User, viewer?: User) {
  const unlocked = viewer?.id === user.id || (viewer ? await hasContactUnlock(viewer, user.id) : false);
  const request = viewer && viewer.id !== user.id && (
    (viewer.role === "student" && user.role === "tutor") ||
    (viewer.role === "tutor" && user.role === "student")
  )
    ? await requestRepository.between(viewer.role === "student" ? viewer.id : user.id, viewer.role === "student" ? user.id : viewer.id)
    : null;
  return {
    ...user,
    city: user.location.city,
    state: user.location.state,
    district: user.location.district,
    pincode: user.location.pincode,
    online: user.modes.includes("online"),
    phone: unlocked ? user.phone : "",
    whatsapp: unlocked ? user.whatsapp : "",
    contactUnlocked: unlocked,
    requestStatus: request?.status ?? null,
    isConnected: unlocked
  };
}

export async function toPostDto(post: Post, viewer?: User) {
  const author = await userRepository.findById(post.authorId);
  const bids = post.kind === "requirement" ? await bidRepository.byRequirement(post.id) : [];
  const analytics = computeBidAnalytics(bids);
  const commentItems = await Promise.all(post.comments.map(async (comment) => {
    const commentAuthor = await userRepository.findById(comment.authorId);
    return {
      ...comment,
      authorName: commentAuthor?.name ?? "Unknown",
      authorAvatar: commentAuthor?.avatar ?? ""
    };
  }));

  let authorRequestStatus: "pending" | "accepted" | "rejected" | null = null;
  let requestDirection: "sent" | "incoming" | null = null;
  let incomingRequestCount = 0;
  let hasMyBid = false;
  let myBidStatus: "pending" | "accepted" | "rejected" | null = null;

  if (viewer) {
    if (viewer.id !== post.authorId) {
      const studentId = post.authorRole === "student" ? post.authorId : viewer.role === "student" ? viewer.id : null;
      const tutorId = post.authorRole === "tutor" ? post.authorId : viewer.role === "tutor" ? viewer.id : null;
      if (studentId && tutorId) {
        const request = await requestRepository.between(studentId, tutorId);
        if (request) {
          authorRequestStatus = request.status;
          const senderId = request.requesterId ?? request.studentId;
          requestDirection = viewer.id === senderId ? "sent" : "incoming";
        }
      }
      if (viewer.role === "tutor" && post.kind === "requirement" && post.authorRole === "student") {
        const mine = bids.find((bid) => bid.tutorId === viewer.id);
        hasMyBid = Boolean(mine);
        myBidStatus = mine?.status ?? null;
      }
    } else if (viewer.role === "tutor" && post.authorRole === "tutor") {
      const requests = await requestRepository.byTutor(post.authorId);
      incomingRequestCount = requests.filter((request) => request.status === "pending").length;
    }
  }

  return {
    ...post,
    authorName: author?.name ?? "Unknown",
    authorAvatar: author?.avatar ?? "",
    city: post.location?.city,
    likes: post.likes.length,
    comments: post.comments.length,
    commentItems,
    bidCount: analytics.bidCount,
    highestBid: analytics.highestBid,
    lowestBid: analytics.lowestBid,
    latestBid: analytics.latestBid,
    bidAnalytics: analytics,
    authorRequestStatus,
    requestDirection,
    incomingRequestCount,
    hasMyBid,
    myBidStatus
  };
}

function computeBidAnalytics(bids: Bid[]) {
  if (!bids.length) {
    return { bidCount: 0, highestBid: null as number | null, lowestBid: null as number | null, latestBid: null as { price: number; createdAt: string; tutorName: string } | null };
  }
  const prices = bids.map((bid) => bid.price);
  const latest = [...bids].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  return {
    bidCount: bids.length,
    highestBid: Math.max(...prices),
    lowestBid: Math.min(...prices),
    latestBid: latest ? { price: latest.price, createdAt: latest.createdAt, tutorName: "" } : null
  };
}

export async function enrichBidAnalytics(bids: Bid[]) {
  const analytics = computeBidAnalytics(bids);
  if (analytics.latestBid) {
    const tutor = await userRepository.findById(bids.find((bid) => bid.createdAt === analytics.latestBid!.createdAt && bid.price === analytics.latestBid!.price)?.tutorId ?? "");
    if (tutor) analytics.latestBid.tutorName = tutor.name;
  }
  return analytics;
}

export async function toBidDto(bid: Bid) {
  const [tutor, post] = await Promise.all([
    userRepository.findById(bid.tutorId),
    postRepository.findById(bid.requirementId)
  ]);
  const student = post ? await userRepository.findById(post.authorId) : undefined;
  const unlocked = bid.status === "accepted";
  return {
    ...bid,
    requirementTitle: post?.title ?? "",
    requirementBody: post?.body ?? "",
    requirementBudget: post?.budget ?? "",
    requirementMode: post?.mode ?? "",
    requirementCity: post?.location?.city ?? "",
    requirementTags: post?.tags ?? [],
    studentId: student?.id ?? "",
    studentName: student?.name ?? "Unknown",
    studentAvatar: student?.avatar ?? "",
    studentPhone: unlocked ? student?.phone ?? "" : "",
    studentWhatsapp: unlocked ? student?.whatsapp ?? "" : "",
    tutorName: tutor?.name ?? "Unknown",
    tutorAvatar: tutor?.avatar ?? "",
    tutorHeadline: tutor?.headline ?? "",
    tutorBio: tutor?.bio ?? "",
    tutorEducation: tutor?.education ?? tutor?.customEducation ?? "",
    tutorExperienceYears: tutor?.experienceYears ?? 0,
    tutorRating: tutor?.rating ?? 0,
    tutorReviews: tutor?.reviews ?? 0,
    tutorSubjects: tutor?.subjects ?? [],
    tutorPhone: unlocked ? tutor?.phone ?? "" : "",
    tutorWhatsapp: unlocked ? tutor?.whatsapp ?? "" : "",
    contactUnlocked: unlocked
  };
}

export async function toRequestDto(
  request: Awaited<ReturnType<typeof requestRepository.all>>[number],
  viewer?: User
) {
  const [student, tutor] = await Promise.all([
    userRepository.findById(request.studentId),
    userRepository.findById(request.tutorId)
  ]);
  const approverId = requesterIdFrom(request) === request.studentId ? request.tutorId : request.studentId;
  const senderId = request.requesterId ?? request.studentId;
  const isAccepted = request.status === "accepted";
  const studentRequirements = student
    ? (await postRepository.all()).filter((p) => p.authorId === student.id && p.kind === "requirement" && p.status === "active")
    : [];
  const latestRequirement = studentRequirements[0];
  return {
    ...request,
    requesterId: senderId,
    studentName: student?.name ?? "Unknown",
    studentAvatar: student?.avatar ?? "",
    studentEducation: student?.education ?? student?.customEducation ?? student?.grade ?? "",
    studentGrade: student?.grade ?? "",
    studentBio: student?.bio ?? "",
    studentPhone: isAccepted ? student?.phone ?? "" : "",
    studentWhatsapp: isAccepted ? student?.whatsapp ?? "" : "",
    tutorName: tutor?.name ?? "Unknown",
    tutorAvatar: tutor?.avatar ?? "",
    tutorHeadline: tutor?.headline ?? "",
    tutorBio: tutor?.bio ?? "",
    tutorEducation: tutor?.education ?? tutor?.customEducation ?? "",
    tutorExperienceYears: tutor?.experienceYears ?? 0,
    tutorRating: tutor?.rating ?? 0,
    tutorReviews: tutor?.reviews ?? 0,
    tutorPhone: isAccepted ? tutor?.phone ?? "" : "",
    tutorWhatsapp: isAccepted ? tutor?.whatsapp ?? "" : "",
    requirementSummary: latestRequirement
      ? { id: latestRequirement.id, title: latestRequirement.title, budget: latestRequirement.budget ?? "", tags: latestRequirement.tags ?? [] }
      : null,
    contactUnlocked: isAccepted,
    canRespond: request.status === "pending" && viewer?.id === approverId,
    direction: viewer?.id === senderId ? "sent" : viewer?.id === approverId ? "incoming" : "other"
  };
}

function requesterIdFrom(request: Awaited<ReturnType<typeof requestRepository.all>>[number]) {
  return request.requesterId ?? request.studentId;
}
