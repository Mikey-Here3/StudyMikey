"use server";

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { queueService } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function submitCodeAction(payload: {
  problemId: string;
  code: string;
  language: "CPP";
  contestId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "You must be authenticated to submit code." };
    }

    if (!payload.code || !payload.problemId) {
      return { success: false, error: "Code and problemId are required." };
    }

    // 1. Insert base submission in Neon DB in QUEUED state
    const [sub] = await db
      .insert(submissions)
      .values({
        userId: session.user.id,
        problemId: payload.problemId,
        contestId: payload.contestId || null,
        code: payload.code,
        language: payload.language,
        status: "QUEUED",
      })
      .returning();

    // 2. Push job to the Redis / local mock queue
    await queueService.pushJob("judge:queue", {
      submissionId: sub.id,
      problemId: payload.problemId,
      code: payload.code,
      language: payload.language,
    });

    return { success: true, submissionId: sub.id };
  } catch (error: any) {
    console.error("Submission Error:", error);
    return { success: false, error: error.message || "Failed to submit code." };
  }
}
