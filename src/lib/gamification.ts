import { db } from "@/db";
import { profiles, problems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function awardSolveRewards(
  userId: string,
  problemId: string,
  contestId?: string | null
) {
  try {
    console.log(`[Gamification] Computing rewards for user ${userId} on problem ${problemId}...`);

    // 1. Fetch the problem details
    const [problem] = await db
      .select({
        difficulty: problems.difficulty,
        title: problems.title,
      })
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);

    if (!problem) {
      console.warn(`[Gamification] Problem ${problemId} not found.`);
      return;
    }

    // Determine base XP and Rating based on difficulty
    let baseXp = 10;
    let ratingGain = 5;

    if (problem.difficulty === "MEDIUM") {
      baseXp = 30;
      ratingGain = 15;
    } else if (problem.difficulty === "HARD") {
      baseXp = 100;
      ratingGain = 40;
    }

    // Apply contest multiplier (1.5x)
    const finalXp = contestId ? Math.floor(baseXp * 1.5) : baseXp;

    // 2. Fetch current profile details
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile) {
      console.warn(`[Gamification] Profile for user ${userId} not found.`);
      return;
    }

    const currentXp = profile.xp || 0;
    const currentRating = profile.rating || 1200;
    const currentMaxRating = profile.maxRating || 1200;
    const currentStreak = profile.streak || 0;
    const lastActive = profile.lastActiveDate; // format: YYYY-MM-DD or Date object

    // Calculate new XP, Level and Rating
    const newXp = currentXp + finalXp;
    
    // Level L needs 100 * L^2. Formula: L = floor(sqrt(XP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
    
    const newRating = currentRating + ratingGain;
    const newMaxRating = Math.max(currentMaxRating, newRating);

    // Calculate Streak
    const todayStr = new Date().toISOString().split("T")[0];
    let newStreak = currentStreak;

    if (!lastActive) {
      // First solve
      newStreak = 1;
    } else {
      const lastActiveStr = lastActive instanceof Date 
        ? lastActive.toISOString().split("T")[0] 
        : new String(lastActive).toString().split("T")[0];

      if (lastActiveStr !== todayStr) {
        const lastActiveDateObj = new Date(lastActiveStr);
        const todayDateObj = new Date(todayStr);
        const diffTime = Math.abs(todayDateObj.getTime() - lastActiveDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Solved consecutive day
          newStreak = currentStreak + 1;
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1;
        }
      }
    }

    // 3. Commit profile updates
    await db
      .update(profiles)
      .set({
        xp: newXp,
        level: newLevel,
        rating: newRating,
        maxRating: newMaxRating,
        streak: newStreak,
        lastActiveDate: todayStr as any,
      })
      .where(eq(profiles.userId, userId));

    console.log(
      `[Gamification] Profile updated! User: ${userId}. +${finalXp} XP (total: ${newXp}), Level: ${newLevel}, +${ratingGain} Rating (total: ${newRating}), Streak: ${newStreak}d`
    );
  } catch (error) {
    console.warn("[Gamification] Database connection issue. Skipping gamification awards.", error);
  }
}
