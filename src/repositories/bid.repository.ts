import type { Bid } from "../models/types.js";
import { BidModel } from "../models/bid.model.js";

export const bidRepository = {
  all: () => BidModel.find().sort({ createdAt: -1 }).lean<Bid[]>().exec(),
  findById: (id: string) => BidModel.findOne({ id }).lean<Bid>().exec(),
  byRequirement: (requirementId: string) => BidModel.find({ requirementId }).sort({ createdAt: -1 }).lean<Bid[]>().exec(),
  byTutor: (tutorId: string) => BidModel.find({ tutorId }).sort({ createdAt: -1 }).lean<Bid[]>().exec(),
  create: (bid: Bid) => BidModel.create(bid).then((doc) => doc.toObject() as Bid),
  update: (id: string, patch: Partial<Bid>) =>
    BidModel.findOneAndUpdate({ id }, patch, { new: true }).lean<Bid>().exec()
};
