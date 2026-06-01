import { OtpModel } from "../models/otp.model.js";
import type { AuthMode, OtpCode } from "../models/types.js";

export const otpRepository = {
  create: (otp: OtpCode) => OtpModel.create(otp).then((doc) => doc.toObject() as OtpCode),
  latestActive: (email: string, mode: AuthMode) =>
    OtpModel.findOne({
      email: email.toLowerCase(),
      mode,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }).lean<OtpCode>().exec(),
  incrementAttempts: (id: string) =>
    OtpModel.findOneAndUpdate({ id }, { $inc: { attempts: 1 } }, { returnDocument: "after" }).lean<OtpCode>().exec(),
  consume: (id: string) =>
    OtpModel.findOneAndUpdate({ id }, { consumedAt: new Date() }, { returnDocument: "after" }).lean<OtpCode>().exec()
};
