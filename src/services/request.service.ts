import type { BidStatus, User } from "../models/types.js";
import { requestRepository } from "../repositories/request.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError, id } from "../utils/http.js";
import { nowIso } from "../utils/time.js";
import { paginate, type PageQuery } from "../utils/pagination.js";
import { toRequestDto } from "./mapper.service.js";

function requesterId(request: Awaited<ReturnType<typeof requestRepository.all>>[number]) {
  return request.requesterId ?? request.studentId;
}

function requestApproverId(request: Awaited<ReturnType<typeof requestRepository.all>>[number]) {
  return requesterId(request) === request.studentId ? request.tutorId : request.studentId;
}

export const requestService = {
  list: async (user: User, pageQuery?: PageQuery & { scope?: string; status?: string }) => {
    const allItems = user.role === "student" ? await requestRepository.byStudent(user.id) : await requestRepository.byTutor(user.id);
    const scope = pageQuery?.scope ?? "requests";
    let items = allItems;

    if (scope === "connections") {
      items = items.filter((request) => request.status === "accepted");
    } else if (scope === "sent") {
      items = items.filter((request) => requesterId(request) === user.id);
    } else if (scope === "incoming") {
      items = items.filter((request) => requestApproverId(request) === user.id);
    } else if (scope === "requests") {
      items = items.filter((request) => request.status !== "accepted");
    }

    if (pageQuery?.status && pageQuery.status !== "all") {
      items = items.filter((request) => request.status === pageQuery.status);
    }

    if (!pageQuery?.page) return Promise.all(items.map((item) => toRequestDto(item, user)));
    const page = paginate(items, pageQuery);
    return { ...page, items: await Promise.all(page.items.map((item) => toRequestDto(item, user))) };
  },
  create: async (user: User, tutorId: string) => {
    if (user.role !== "student") throw new ApiError(403, "Only students can connect with tutors");
    const tutor = await userRepository.findById(tutorId);
    if (!tutor || tutor.role !== "tutor") throw new ApiError(404, "Tutor not found");
    const existing = await requestRepository.between(user.id, tutorId);
    if (existing) return toRequestDto(existing, user);
    return toRequestDto(await requestRepository.create({ id: id("r"), studentId: user.id, tutorId, requesterId: user.id, status: "pending", createdAt: nowIso() }), user);
  },
  createForStudent: async (user: User, studentId: string) => {
    if (user.role !== "tutor") throw new ApiError(403, "Only tutors can connect with students");
    const student = await userRepository.findById(studentId);
    if (!student || student.role !== "student") throw new ApiError(404, "Student not found");
    const existing = await requestRepository.between(studentId, user.id);
    if (existing) return toRequestDto(existing, user);
    return toRequestDto(await requestRepository.create({ id: id("r"), studentId, tutorId: user.id, requesterId: user.id, status: "pending", createdAt: nowIso() }), user);
  },
  updateStatus: async (user: User, requestId: string, status: BidStatus) => {
    if (!["accepted", "rejected"].includes(status)) throw new ApiError(400, "Invalid request status");
    const request = await requestRepository.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found");
    const approverId = requestApproverId(request);
    if (approverId !== user.id) throw new ApiError(403, "Only the requested user can update this request");
    return toRequestDto((await requestRepository.update(requestId, { status }))!, user);
  }
};
