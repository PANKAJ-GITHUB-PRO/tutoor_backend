export type Role = "student" | "tutor";
export type TeachingMode = "online" | "one-to-one" | "group" | "home";
export type PostKind = "general" | "announcement" | "requirement";
export type PostStatus = "active" | "completed" | "expired";
export type BidStatus = "pending" | "accepted" | "rejected";

export interface Location {
  state: string;
  district: string;
  city: string;
  pincode: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  onboarded: boolean;
  avatar: string;
  phone: string;
  whatsapp: string;
  location: Location;
  education?: string;
  customEducation?: string;
  grade?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  subjects: string[];
  modes: TeachingMode[];
  experienceYears: number;
  pricePerHour: number;
  minimumFee: number;
  rating: number;
  reviews: number;
  kycStatus?: "pending" | "verified";
}

export interface Post {
  id: string;
  kind: PostKind;
  authorId: string;
  authorRole: Role;
  title: string;
  body: string;
  tags: string[];
  budget?: string;
  mode?: TeachingMode;
  location?: Location;
  status: PostStatus;
  createdAt: string;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  requirementId: string;
  tutorId: string;
  price: number;
  note: string;
  status: BidStatus;
  createdAt: string;
}

export interface TutorRequest {
  id: string;
  studentId: string;
  tutorId: string;
  requesterId?: string;
  status: BidStatus;
  createdAt: string;
}

export interface Rating {
  id: string;
  tutorId: string;
  studentId: string;
  stars: number;
  review?: string;
  createdAt: string;
}

export type AuthMode = "login" | "register";

export interface OtpCode {
  id: string;
  email: string;
  mode: AuthMode;
  code: string;
  expiresAt: Date;
  consumedAt?: Date;
  attempts: number;
  createdAt: string;
}
