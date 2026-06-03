import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { submissionId, status, executionTime, executionMemory, errorLog, testCasesPassed } = payload;

    if (!submissionId || !status) {
      return NextResponse.json({ error: "submissionId and status are required" }, { status: 400 });
    }

    console.log(`[Judge Callback] Received result for submission ${submissionId}: ${status}`);

    // Update database
    try {
      const [updated] = await db
        .update(submissions)
        .set({
          status,
          executionTime: executionTime !== undefined ? executionTime : null,
          executionMemory: executionMemory !== undefined ? executionMemory : null,
          errorLog: errorLog || null,
          testCasesPassed: testCasesPassed || 0,
        })
        .where(eq(submissions.id, submissionId))
        .returning();
      
      if (!updated) {
        console.warn(`[Judge Callback] Submission ${submissionId} not found in DB.`);
      } else if (status === "ACCEPTED") {
        // Trigger gamification updates asynchronously
        const { awardSolveRewards } = await import("@/lib/gamification");
        await awardSolveRewards(updated.userId, updated.problemId, updated.contestId);
      }
    } catch (dbError) {
      console.warn("[Judge Callback] Database update failed. This is expected if DATABASE_URL is mock.", dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Judge Callback] Error processing callback:", error);
    return NextResponse.json({ error: error.message || "Failed to process callback" }, { status: 500 });
  }
}
