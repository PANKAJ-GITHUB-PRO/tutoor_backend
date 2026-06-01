import type { TutorRequest } from "../models/types.js";
import { RequestModel } from "../models/request.model.js";

export const requestRepository = {
  all: () => RequestModel.find().sort({ createdAt: -1 }).lean<TutorRequest[]>().exec(),
  findById: (id: string) => RequestModel.findOne({ id }).lean<TutorRequest>().exec(),
  between: (studentId: string, tutorId: string) => RequestModel.findOne({ studentId, tutorId }).lean<TutorRequest>().exec(),
  byStudent: (studentId: string) => RequestModel.find({ studentId }).sort({ createdAt: -1 }).lean<TutorRequest[]>().exec(),
  byTutor: (tutorId: string) => RequestModel.find({ tutorId }).sort({ createdAt: -1 }).lean<TutorRequest[]>().exec(),
  create: (request: TutorRequest) => RequestModel.create(request).then((doc) => doc.toObject() as TutorRequest),
  update: (id: string, patch: Partial<TutorRequest>) =>
    RequestModel.findOneAndUpdate({ id }, patch, { new: true }).lean<TutorRequest>().exec()
};
