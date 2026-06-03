import React from "react";
import { db } from "@/db";
import { users, profiles, universities, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import RecruiterClient, { StudentCandidate } from "./recruiter-client";

// Robust fallback candidate list for local preview/development
const FALLBACK_CANDIDATES: StudentCandidate[] = [
  {
    id: "cand-1",
    name: "Jane Doe",
    username: "jane_coder",
    rating: 1845,
    skills: ["C++", "Next.js", "Redis", "Docker", "Typescript"],
    universityName: "FAST National University of Computer and Emerging Sciences",
    isOpenToWork: true,
    solvedCount: 412,
    bio: "Fullstack engineer & competitive programmer. Love building distributed backends and optimizing search structures.",
  },
  {
    id: "cand-2",
    name: "Alice Smith",
    username: "alice_cp",
    rating: 1720,
    skills: ["C++", "Go", "Kubernetes"],
    universityName: "University of Engineering and Technology, Lahore",
    isOpenToWork: true,
    solvedCount: 310,
    bio: "Competitive programming specialist. Focused on Segment Trees, graph networks, and high-concurrency systems.",
  },
  {
    id: "cand-3",
    name: "Alex Johnson",
    username: "alex_smith",
    rating: 1620,
    skills: ["Python", "Django", "PostgreSQL"],
    universityName: "National University of Sciences and Technology",
    isOpenToWork: true,
    solvedCount: 250,
    bio: "Backend developer and machine learning hobbyist. Strong foundation in query optimizations.",
  },
  {
    id: "cand-4",
    name: "Bob Miller",
    username: "bob_algo",
    rating: 1450,
    skills: ["Java", "Spring Boot"],
    universityName: "COMSATS University Islamabad",
    isOpenToWork: false,
    solvedCount: 110,
    bio: "Java software engineer. Curious about cloud patterns and serverless structures.",
  },
];

export default async function RecruiterPortal() {
  const session = await getServerSession(authOptions);
  const isRecruiter = session?.user?.role === "RECRUITER";

  let candidates: StudentCandidate[] = [];

  try {
    // 1. Query students with profiles and universities
    const dbStudents = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        rating: profiles.rating,
        skills: profiles.skills,
        isOpenToWork: profiles.isOpenToWork,
        bio: profiles.bio,
        universityName: universities.name,
      })
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(universities, eq(profiles.universityId, universities.id))
      .where(eq(users.role, "STUDENT"));

    // 2. Query all accepted submissions to calculate solvedCounts
    const acceptedSubmissions = await db
      .select({
        userId: submissions.userId,
      })
      .from(submissions)
      .where(eq(submissions.status, "ACCEPTED"));

    const solvesCountMap: Record<string, number> = {};
    for (const sub of acceptedSubmissions) {
      solvesCountMap[sub.userId] = (solvesCountMap[sub.userId] || 0) + 1;
    }

    // 3. Map database results to candidate model
    candidates = dbStudents.map((stud: any) => {
      // Create a nice display name from username
      const cleanName = stud.username
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char: string) => char.toUpperCase());

      return {
        id: stud.id,
        name: cleanName,
        username: stud.username,
        rating: stud.rating || 1200,
        skills: stud.skills || [],
        universityName: stud.universityName || "Independent Student",
        isOpenToWork: stud.isOpenToWork || false,
        solvedCount: solvesCountMap[stud.id] || 0,
        bio: stud.bio || "No biography details shared yet.",
      };
    });

    // Fall back to details if DB isn't seeded or empty
    if (candidates.length === 0) {
      candidates = FALLBACK_CANDIDATES;
    }
  } catch (error) {
    console.warn("Database lookup failed on recruiter candidates query. Fetching fallback candidate array.", error);
    candidates = FALLBACK_CANDIDATES;
  }

  return (
    <RecruiterClient
      initialCandidates={candidates}
      isRecruiter={isRecruiter}
    />
  );
}
