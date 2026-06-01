import type { Role, User } from "../models/types.js";
import { UserModel } from "../models/user.model.js";

export const userRepository = {
  all: () => UserModel.find().sort({ createdAt: -1 }).lean<User[]>().exec(),
  findById: (id: string) => UserModel.findOne({ id }).lean<User>().exec(),
  findByEmail: (email: string) => UserModel.findOne({ email: email.toLowerCase() }).lean<User>().exec(),
  create: (user: User) => UserModel.create(user).then((doc) => doc.toObject() as User),
  update: (id: string, patch: Partial<User>) =>
    UserModel.findOneAndUpdate({ id }, patch, { new: true }).lean<User>().exec(),
  byRole: (role: Role) => UserModel.find({ role }).sort({ rating: -1, reviews: -1 }).lean<User[]>().exec()
};
