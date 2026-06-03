import "dotenv/config";
import { db } from "./index";
import { users, problems, contests, contestProblems, contestParticipants } from "./schema";
import { eq, like, and } from "drizzle-orm";

async function main() {
  console.log("=================================================");
  console.log(" Seeding 3 Professional/Expert Admin Contests... ");
  console.log("=================================================");

  // 1. Fetch Admin User
  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (!adminUser) {
    console.error("ERROR: Admin user not found. Run base seeders first.");
    process.exit(1);
  }
  const adminId = adminUser.id;
  console.log(`Host Creator ID (Admin): ${adminId}`);

  // Clean up existing contests with target titles to allow idempotency
  const contestTitles = [
    "Grandmaster Cup: Dynamic Optimization",
    "Master League: System Design & Structures",
    "Elite Arena: Bitwise Math & Logic"
  ];
  for (const title of contestTitles) {
    await db.delete(contests).where(eq(contests.title, title));
  }
  console.log("Cleaned up any existing versions of the advanced contests.");

  // 2. Fetch mock students to enroll
  const mockStudents = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "STUDENT"))
    .limit(5);

  const studentIds = mockStudents.map((s: { id: string }) => s.id);
  console.log(`Found ${studentIds.length} students to enroll as contest participants.`);

  // 3. Query dynamic C++ challenges from database
  // Dynamic Programming problems
  const dpProbs = await db
    .select({ id: problems.id, title: problems.title })
    .from(problems)
    .where(like(problems.title, "Dynamic Programming:%"))
    .limit(2);

  // OOP Design problems
  const oopProbs = await db
    .select({ id: problems.id, title: problems.title })
    .from(problems)
    .where(like(problems.title, "OOP Class Design:%"))
    .limit(2);

  // Bit Manipulation problems
  const bitProbs = await db
    .select({ id: problems.id, title: problems.title })
    .from(problems)
    .where(like(problems.title, "Bit Manipulation:%"))
    .limit(2);

  console.log(`Mapped challenges - DP: ${dpProbs.length}, OOP: ${oopProbs.length}, Bits: ${bitProbs.length}`);

  // Fallbacks if tables aren't fully seeded
  const fallbackProblem = await db.select({ id: problems.id }).from(problems).limit(1);
  const getProblemId = (list: any[], idx: number) => {
    if (list[idx]) return list[idx].id;
    return fallbackProblem[0]?.id || null;
  };

  // 4. Define Contest details
  const now = new Date();

  // Grandmaster Cup: Starts 1 hour ago, ends in 3 hours (LIVE NOW)
  const grandmasterStart = new Date(now.getTime() - 60 * 60 * 1000);
  const grandmasterEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // Master League: Starts tomorrow
  const masterStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const masterEnd = new Date(now.getTime() + 27 * 60 * 60 * 1000);

  // Elite Arena: Starts in 3 days
  const eliteStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const eliteEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

  const advancedContests = [
    {
      title: "Grandmaster Cup: Dynamic Optimization",
      description: "Test your Dynamic Programming and Tabulation skills on advanced recursion equations. Features multi-state optimization and tree structures. Strictly for expert developers.",
      startTime: grandmasterStart,
      endTime: grandmasterEnd,
      durationMinutes: 240,
      status: "APPROVED" as const,
      problems: [
        { id: getProblemId(dpProbs, 0), points: 500, orderNum: 1 },
        { id: getProblemId(dpProbs, 1), points: 1000, orderNum: 2 },
      ]
    },
    {
      title: "Master League: System Design & Structures",
      description: "A contest focused on advanced object-oriented design, custom queue pipelines, and binary trie structures. Implement fast O(1) structures under strict memory boundaries.",
      startTime: masterStart,
      endTime: masterEnd,
      durationMinutes: 180,
      status: "APPROVED" as const,
      problems: [
        { id: getProblemId(oopProbs, 0), points: 400, orderNum: 1 },
        { id: getProblemId(oopProbs, 1), points: 800, orderNum: 2 },
      ]
    },
    {
      title: "Elite Arena: Bitwise Math & Logic",
      description: "Solve complex bitwise masks and XOR check equations. Design power-of-two validators and missing element filters without importing standard math libraries.",
      startTime: eliteStart,
      endTime: eliteEnd,
      durationMinutes: 120,
      status: "APPROVED" as const,
      problems: [
        { id: getProblemId(bitProbs, 0), points: 300, orderNum: 1 },
        { id: getProblemId(bitProbs, 1), points: 600, orderNum: 2 },
      ]
    }
  ];

  for (const c of advancedContests) {
    console.log(`Creating advanced contest: "${c.title}"`);
    const [insertedContest] = await db
      .insert(contests)
      .values({
        title: c.title,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
        durationMinutes: c.durationMinutes,
        createdById: adminId,
        isUniversityOnly: false,
        status: c.status,
      })
      .returning();

    // Attach problems
    for (const p of c.problems) {
      if (p.id) {
        console.log(` -> Attaching problem ${p.id} with ${p.points} points.`);
        await db.insert(contestProblems).values({
          contestId: insertedContest.id,
          problemId: p.id,
          points: p.points,
          orderNum: p.orderNum,
        });
      }
    }

    // Enroll mock students
    for (const sId of studentIds) {
      console.log(` -> Enrolling participant: ${sId}`);
      await db.insert(contestParticipants).values({
        contestId: insertedContest.id,
        userId: sId,
      });
    }
  }

  console.log("Advanced contests seeding completed successfully!");
}

main().catch((err) => {
  console.error("Failed to seed advanced contests:", err);
  process.exit(1);
});
