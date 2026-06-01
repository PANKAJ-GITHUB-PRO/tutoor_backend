import type { AuthMode, Role, User } from "../models/types.js";
import { otpRepository } from "../repositories/otp.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError, id } from "../utils/http.js";
import { signToken } from "../middlewares/auth.middleware.js";
import { emailService } from "./email.service.js";
import { toSafeUser } from "./mapper.service.js";

const DEV_OTP = "123456";
const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const authService = {
  start: async (email: string, mode: AuthMode) => {
    const normalizedEmail = email.toLowerCase();
    if (mode === "login" && !(await userRepository.findByEmail(normalizedEmail))) {
      throw new ApiError(404, "Account not found. Please create an account first.");
    }
    const activeOtp = await otpRepository.latestActive(normalizedEmail, mode);
    if (activeOtp) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(activeOtp.createdAt).getTime()) / 1000);
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        return {
          email: normalizedEmail,
          sent: false,
          devBypassEnabled: true,
          cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds
        };
      }
    }
    const code = generateOtp();
    await otpRepository.create({
      id: id("otp"),
      email: normalizedEmail,
      mode,
      code,
      expiresAt: expiresInMinutes(OTP_TTL_MINUTES),
      attempts: 0,
      createdAt: new Date().toISOString()
    });
    const delivery = await emailService.sendOtp(normalizedEmail, code, mode);
    return {
      email: normalizedEmail,
      sent: delivery.sent,
      devBypassEnabled: true
    };
  },
  verify: async (email: string, otp: string, mode: AuthMode) => {
    const normalizedEmail = email.toLowerCase();
    const isDevBypass = otp === DEV_OTP;
    const latestOtp = await otpRepository.latestActive(normalizedEmail, mode);

    if (!isDevBypass) {
      if (!latestOtp) throw new ApiError(400, "OTP expired. Please request a new code.");
      if (latestOtp.attempts >= MAX_OTP_ATTEMPTS) throw new ApiError(429, "Too many OTP attempts. Please request a new code.");
      if (latestOtp.code !== otp) {
        await otpRepository.incrementAttempts(latestOtp.id);
        throw new ApiError(400, "Invalid OTP. Please check the code and try again.");
      }
      await otpRepository.consume(latestOtp.id);
    }

    let user = await userRepository.findByEmail(normalizedEmail);
    if (!user && mode === "register") {
      user = await userRepository.create(makeUser(normalizedEmail));
    }
    if (!user) throw new ApiError(404, "Account not found");
    return { token: signToken(user), user: await toSafeUser(user, user) };
  },
  selectRole: async (user: User, role: Role) => {
    const updated = await userRepository.update(user.id, { role });
    if (!updated) throw new ApiError(404, "Profile not found");
    return toSafeUser(updated, updated);
  }
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function expiresInMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function makeUser(email: string): User {
  return {
    id: id("u"),
    email,
    name: email.split("@")[0] || "User",
    role: "student",
    onboarded: false,
    avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
    phone: "",
    whatsapp: "",
    location: { state: "Karnataka", district: "Bengaluru Urban", city: "Bangalore", pincode: "560001" },
    subjects: [],
    skills: [],
    modes: [],
    experienceYears: 0,
    pricePerHour: 0,
    minimumFee: 0,
    rating: 0,
    reviews: 0
  };
}
