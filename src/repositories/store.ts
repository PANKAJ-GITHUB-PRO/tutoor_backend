import type { Bid, Post, TutorRequest, User } from "../models/types.js";

const avatar = (img: number) => `https://i.pravatar.cc/200?img=${img}`;

export const users: User[] = [
  {
    id: "t1",
    email: "maya@tudoor.com",
    name: "Maya Sharma",
    role: "tutor",
    onboarded: true,
    avatar: avatar(47),
    headline: "Calculus & JEE Mathematics mentor",
    bio: "IIT Bombay alum. 8+ years helping students crack JEE and board exams with clarity-first teaching.",
    subjects: ["Mathematics", "Physics"],
    skills: ["JEE Advanced", "Calculus", "Algebra"],
    education: "B.Tech, IIT Bombay",
    experienceYears: 8,
    modes: ["online", "one-to-one"],
    rating: 4.9,
    reviews: 214,
    pricePerHour: 800,
    minimumFee: 600,
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    location: { state: "Karnataka", district: "Bengaluru Urban", city: "Bangalore", pincode: "560001" },
    kycStatus: "verified"
  },
  {
    id: "t2",
    email: "arjun@tudoor.com",
    name: "Arjun Verma",
    role: "tutor",
    onboarded: true,
    avatar: avatar(12),
    headline: "Full-stack coding coach",
    bio: "Ex-Google engineer. Teaches React, TypeScript and system design with project-based learning.",
    subjects: ["Computer Science", "Coding"],
    skills: ["React", "TypeScript", "DSA"],
    education: "M.S. Computer Science, BITS Pilani",
    experienceYears: 6,
    modes: ["online", "group"],
    rating: 4.8,
    reviews: 132,
    pricePerHour: 1200,
    minimumFee: 900,
    phone: "+91 90000 12121",
    whatsapp: "+91 90000 12121",
    location: { state: "Telangana", district: "Hyderabad", city: "Hyderabad", pincode: "500081" },
    kycStatus: "verified"
  },
  {
    id: "t3",
    email: "neha@tudoor.com",
    name: "Neha Iyer",
    role: "tutor",
    onboarded: true,
    avatar: avatar(32),
    headline: "IELTS & spoken English",
    bio: "Cambridge-certified trainer. Helps learners get to band 8+ with focused weekly sprints.",
    subjects: ["English", "Languages"],
    skills: ["IELTS", "Spoken English", "Grammar"],
    education: "M.A. English Literature",
    experienceYears: 5,
    modes: ["online", "one-to-one", "group"],
    rating: 4.95,
    reviews: 308,
    pricePerHour: 700,
    minimumFee: 500,
    phone: "+91 99887 76655",
    whatsapp: "+91 99887 76655",
    location: { state: "Maharashtra", district: "Pune", city: "Pune", pincode: "411001" },
    kycStatus: "verified"
  },
  {
    id: "s1",
    email: "ananya@tudoor.com",
    name: "Ananya Roy",
    role: "student",
    onboarded: true,
    avatar: avatar(5),
    grade: "Class 12 - Science",
    education: "Class 12 - Science",
    subjects: [],
    skills: [],
    experienceYears: 0,
    modes: [],
    rating: 0,
    reviews: 0,
    pricePerHour: 0,
    minimumFee: 0,
    phone: "+91 90000 10101",
    whatsapp: "+91 90000 10101",
    location: { state: "Karnataka", district: "Bengaluru Urban", city: "Bangalore", pincode: "560034" }
  }
];

export const posts: Post[] = [
  {
    id: "p1",
    kind: "announcement",
    authorId: "t1",
    authorRole: "tutor",
    title: "Weekend JEE crash batch starting Dec 1",
    body: "Live online intensive: 12 sessions covering calculus + coordinate geometry. Limited to 15 seats.",
    tags: ["JEE", "Mathematics", "Online"],
    mode: "online",
    location: users[0].location,
    status: "active",
    createdAt: "2h",
    likes: [],
    comments: []
  },
  {
    id: "p2",
    kind: "requirement",
    authorId: "s1",
    authorRole: "student",
    title: "Need a Chemistry tutor for class 12 boards",
    body: "Looking for 3 sessions/week, organic chemistry focus. Preferably home tuition near Koramangala.",
    tags: ["Chemistry", "Class 12", "Home"],
    budget: "Rs 600-Rs 900/hr",
    mode: "home",
    location: users[3].location,
    status: "active",
    createdAt: "5h",
    likes: [],
    comments: []
  },
  {
    id: "p3",
    kind: "announcement",
    authorId: "t3",
    authorRole: "tutor",
    title: "Free IELTS speaking workshop this Saturday",
    body: "Join a 90-min live session with mock interviews and personalised feedback.",
    tags: ["IELTS", "English", "Free"],
    mode: "online",
    location: users[2].location,
    status: "active",
    createdAt: "1d",
    likes: [],
    comments: []
  }
];

export const bids: Bid[] = [
  { id: "b1", requirementId: "p2", tutorId: "t2", price: 750, note: "I can do 3 sessions/week, organic-first approach.", status: "pending", createdAt: "1h" },
  { id: "b2", requirementId: "p2", tutorId: "t1", price: 800, note: "Available Mon/Wed/Fri evenings. First class free.", status: "accepted", createdAt: "3h" }
];

export const requests: TutorRequest[] = [];
