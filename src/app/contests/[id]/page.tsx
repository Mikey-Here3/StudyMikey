import React from "react";
import { db } from "@/db";
import { contests, universities, contestProblems, problems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getContestLeaderboardAction } from "@/lib/actions/contest-actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ContestArena from "./contest-arena";

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: contestId } = await params;
  const session = await getServerSession(authOptions);

  let contestInfo: any = null;
  let rankings: any[] = [];
  let problemsList: any[] = [];

  try {
    const [c] = await db
      .select({
        id: contests.id,
        title: contests.title,
        description: contests.description,
        startTime: contests.startTime,
        endTime: contests.endTime,
        durationMinutes: contests.durationMinutes,
        status: contests.status,
        isUniversityOnly: contests.isUniversityOnly,
        universityName: universities.name,
      })
      .from(contests)
      .leftJoin(universities, eq(contests.universityId, universities.id))
      .where(eq(contests.id, contestId))
      .limit(1);

    contestInfo = c;

    if (c) {
      const boardRes = await getContestLeaderboardAction(contestId);
      if (boardRes.success) {
        rankings = boardRes.rankings || [];
        problemsList = boardRes.problems || [];
      }
    }
  } catch (error) {
    console.warn("Contest Arena database query error, loading fallback mockup dataset.", error);
  }

  // Fallback if contest does not exist or database is disconnected
  if (!contestInfo) {
    const now = new Date();
    contestInfo = {
      id: contestId,
      title: contestId.includes("past") ? "Speed Run #1" : "Weekly Challenge #42",
      description: contestId.includes("past") 
        ? "A fast-paced algorithmic sprint. Prove your coding speed on basic arrays and sequences."
        : "Platform-wide weekend challenge covering classic Dynamic Programming and Graph queries.",
      startTime: contestId.includes("past") 
        ? new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
        : new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      endTime: contestId.includes("past")
        ? new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString()
        : new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      durationMinutes: contestId.includes("past") ? 60 : 180,
      status: contestId.includes("past") ? "FINISHED" : "APPROVED",
      universityName: null,
    };

    problemsList = [
      { id: "1", title: "Two Sum", slug: "two-sum", points: 100, difficulty: "EASY" },
      { id: "2", title: "Fibonacci Number", slug: "fibonacci-number", points: 200, difficulty: "EASY" },
      { id: "3", title: "Longest Common Subsequence", slug: "longest-common-subsequence", points: 300, difficulty: "MEDIUM" },
    ];

    rankings = [
      { rank: 1, username: "jane_coder", score: 300, penaltyTime: 1240 },
      { rank: 2, username: "alice_cp", score: 300, penaltyTime: 1980 },
      { rank: 3, username: "alex_smith", score: 100, penaltyTime: 650 },
      { rank: 4, username: "bob_algo", score: 0, penaltyTime: 0 },
    ];
  }

  // Normalize dates for serialization
  const serializedContest = {
    ...contestInfo,
    startTime: contestInfo.startTime instanceof Date ? contestInfo.startTime.toISOString() : new String(contestInfo.startTime).toString(),
    endTime: contestInfo.endTime instanceof Date ? contestInfo.endTime.toISOString() : new String(contestInfo.endTime).toString(),
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <ContestArena
          contest={serializedContest}
          initialRankings={rankings}
          problems={problemsList}
          currentUser={session?.user ?? null}
        />
      </div>
    </div>
  );
}
