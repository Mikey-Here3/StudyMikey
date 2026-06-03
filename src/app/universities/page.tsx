import React from "react";
import { db } from "@/db";
import { universities, profiles } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import UniversitiesClient from "./universities-client";

export default async function UniversitiesPage() {
  let dbUniversities: any[] = [];

  try {
    // Query universities alongside active solver student count and average rating
    dbUniversities = await db
      .select({
        id: universities.id,
        name: universities.name,
        slug: universities.slug,
        emailDomain: universities.emailDomain,
        score: universities.score,
        nationalRank: universities.nationalRank,
        solverCount: sql<number>`count(${profiles.userId})::int`,
        avgRating: sql<number>`round(avg(${profiles.rating}))::int`,
      })
      .from(universities)
      .leftJoin(profiles, eq(universities.id, profiles.universityId))
      .groupBy(universities.id)
      .orderBy(universities.score);
  } catch (error) {
    console.warn("Universities database query error, loading fallback mockup dataset.", error);
  }

  // Fallback to mock universities if empty or offline
  if (!dbUniversities || dbUniversities.length === 0) {
    dbUniversities = [
      {
        id: "univ-1",
        name: "FAST National University of Computer and Emerging Sciences",
        slug: "fast-nu",
        emailDomain: "nu.edu.pk",
        score: 1845,
        nationalRank: 1,
        solverCount: 24,
        avgRating: 1680,
      },
      {
        id: "univ-2",
        name: "University of Engineering and Technology, Lahore",
        slug: "uet",
        emailDomain: "uet.edu.pk",
        score: 1720,
        nationalRank: 2,
        solverCount: 18,
        avgRating: 1540,
      },
      {
        id: "univ-3",
        name: "National University of Sciences and Technology",
        slug: "nust",
        emailDomain: "nust.edu.pk",
        score: 1620,
        nationalRank: 3,
        solverCount: 15,
        avgRating: 1490,
      },
      {
        id: "univ-4",
        name: "COMSATS University Islamabad",
        slug: "comsats",
        emailDomain: "comsats.edu.pk",
        score: 1450,
        nationalRank: 4,
        solverCount: 12,
        avgRating: 1380,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 relative overflow-hidden text-zinc-900">
      {/* Background glow layers */}
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.35] pointer-events-none z-0" />

      {/* Blurred blobs */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <UniversitiesClient initialUniversities={dbUniversities} />
      </div>
    </div>
  );
}
