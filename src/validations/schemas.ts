import { z } from "zod";

export const roleSchema = z.enum(["student", "tutor"]);
export const modeSchema = z.enum(["online", "one-to-one", "group", "home"]);

export const authStartSchema = z.object({
  email: z.string().email(),
  mode: z.enum(["login", "register"])
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  mode: z.enum(["login", "register"])
});

export const roleSelectSchema = z.object({ role: roleSchema });

export const locationSchema = z.object({
  state: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().min(4).max(10)
});

const indianMobileSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.union([
    z.undefined(),
    z.string()
      .transform((value) => value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))
      .refine((digits) => /^[6-9]\d{9}$/.test(digits), "Enter a valid 10-digit Indian mobile number")
      .transform((digits) => `+91 ${digits}`)
  ])
);

export const profileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: indianMobileSchema.optional(),
  whatsapp: indianMobileSchema.optional(),
  location: locationSchema.optional(),
  education: z.string().optional(),
  customEducation: z.string().optional(),
  grade: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  modes: z.array(modeSchema).optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  pricePerHour: z.coerce.number().min(0).optional(),
  minimumFee: z.coerce.number().min(0).optional(),
  kycStatus: z.enum(["pending", "verified"]).optional()
});

export const postCreateSchema = z.object({
  kind: z.enum(["general", "announcement", "requirement"]),
  title: z.string().min(3),
  body: z.string().min(3),
  tags: z.array(z.string()).default([]),
  budget: z.string().optional(),
  mode: modeSchema.optional(),
  status: z.enum(["active", "completed", "expired"]).optional(),
  location: locationSchema.optional()
});

export const postUpdateSchema = postCreateSchema.partial().extend({
  status: z.enum(["active", "completed", "expired"]).optional()
});

export const commentCreateSchema = z.object({
  body: z.string().min(1).max(1000)
});

export const ratingCreateSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5),
  review: z.string().max(1000).optional()
});

export const bidCreateSchema = z.object({
  price: z.coerce.number().min(1),
  note: z.string().min(3)
});

export const statusSchema = z.object({
  status: z.enum(["accepted", "rejected"])
});
