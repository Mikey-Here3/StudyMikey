import "dotenv/config";
import { db } from "./index";
import {
  users,
  profiles,
  problems,
  testCases,
  universities,
  contests,
  contestProblems,
  contestParticipants,
  submissions,
} from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding started...");

  // 1. Create or fetch admin user
  const adminEmail = "admin@studymikey.com";
  let adminId: string;

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    console.log("Creating dummy Admin user...");
    const hashed = await bcrypt.hash("admin123", 10);
    const [newAdmin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        username: "admin",
        passwordHash: hashed,
        role: "ADMIN",
      })
      .returning();

    await db.insert(profiles).values({
      userId: newAdmin.id,
      bio: "Main system administrator for StudyMikey.",
    });

    adminId = newAdmin.id;
  } else {
    adminId = existingAdmin.id;
  }

  // 2. Seed Universities
  console.log("Seeding Universities...");
  const universityData = [
    {
      name: "FAST National University of Computer and Emerging Sciences",
      slug: "fast-nu",
      emailDomain: "nu.edu.pk",
      logoUrl: null,
      score: 1845,
      nationalRank: 1,
    },
    {
      name: "National University of Sciences and Technology",
      slug: "nust",
      emailDomain: "nust.edu.pk",
      logoUrl: null,
      score: 1620,
      nationalRank: 2,
    },
    {
      name: "COMSATS University Islamabad",
      slug: "comsats",
      emailDomain: "comsats.edu.pk",
      logoUrl: null,
      score: 1450,
      nationalRank: 3,
    },
    {
      name: "University of Engineering and Technology, Lahore",
      slug: "uet",
      emailDomain: "uet.edu.pk",
      logoUrl: null,
      score: 1720,
      nationalRank: 4,
    },
  ];

  const univIds: Record<string, string> = {};

  for (const univ of universityData) {
    const [existingUniv] = await db
      .select()
      .from(universities)
      .where(eq(universities.slug, univ.slug))
      .limit(1);

    if (!existingUniv) {
      const [newUniv] = await db
        .insert(universities)
        .values(univ)
        .returning();
      univIds[univ.slug] = newUniv.id;
      console.log(`Created university: ${univ.name}`);
    } else {
      univIds[univ.slug] = existingUniv.id;
      console.log(`University ${univ.name} already exists.`);
    }
  }

  // 3. Seed Users (Teacher, Recruiter, and Students)
  console.log("Seeding Users & Profiles...");
  const hashedPass = await bcrypt.hash("password123", 10);

  const usersToSeed = [
    {
      email: "teacher@nu.edu.pk",
      username: "dr_carter",
      role: "TEACHER" as const,
      bio: "Professor of Algorithms & Computer Science at FAST.",
      rating: 1500,
      skills: ["C++", "Python", "Teaching"],
      universitySlug: "fast-nu",
      isOpenToWork: false,
    },
    {
      email: "sarah.jenkins@google.com",
      username: "sarah_google",
      role: "RECRUITER" as const,
      bio: "Technical Recruiter at Google, scouting top talent.",
      rating: 1200,
      skills: [],
      universitySlug: undefined,
      isOpenToWork: false,
    },
    {
      email: "student_fast@nu.edu.pk",
      username: "jane_coder",
      role: "STUDENT" as const,
      bio: "Fullstack engineer & CP enthusiast. Love algorithms.",
      rating: 1845,
      skills: ["C++", "Next.js", "Redis", "Docker"],
      universitySlug: "fast-nu",
      isOpenToWork: true,
    },
    {
      email: "student_nust@nust.edu.pk",
      username: "alex_smith",
      role: "STUDENT" as const,
      bio: "Python developer, database engineer in making.",
      rating: 1620,
      skills: ["Python", "Django", "PostgreSQL"],
      universitySlug: "nust",
      isOpenToWork: true,
    },
    {
      email: "student_comsats@comsats.edu.pk",
      username: "bob_algo",
      role: "STUDENT" as const,
      bio: "Java coder, deep learning beginner.",
      rating: 1450,
      skills: ["Java", "Spring Boot"],
      universitySlug: "comsats",
      isOpenToWork: false,
    },
    {
      email: "student_uet@uet.edu.pk",
      username: "alice_cp",
      role: "STUDENT" as const,
      bio: "Competitive programmer. Segment Trees and Graphs.",
      rating: 1720,
      skills: ["C++", "Go", "Kubernetes"],
      universitySlug: "uet",
      isOpenToWork: true,
    },
  ];

  const studentIds: string[] = [];

  for (const u of usersToSeed) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, u.email))
      .limit(1);

    let userId: string;

    if (!existingUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: u.email,
          username: u.username,
          passwordHash: hashedPass,
          role: u.role,
        })
        .returning();
      userId = newUser.id;

      await db.insert(profiles).values({
        userId: newUser.id,
        bio: u.bio,
        rating: u.rating,
        maxRating: u.rating,
        skills: u.skills,
        isOpenToWork: u.isOpenToWork,
        universityId: u.universitySlug ? univIds[u.universitySlug] : null,
      });

      console.log(`Created user: ${u.username}`);
    } else {
      userId = existingUser.id;
      console.log(`User ${u.username} already exists.`);
    }

    if (u.role === "STUDENT") {
      studentIds.push(userId);
    }
  }

  // 4. Seed Problems
  console.log("Seeding Problems...");
  const seededProblems = [
    {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "EASY" as const,
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
      constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
      timeLimit: 2000,
      memoryLimit: 256,
      editorial: `Use a hash map to store the index of each number. For each number, check if its complement (target - num) exists in the map. Complexity is O(N) time and O(N) space.`,
      templateCodeCpp: `#include <vector>
#include <iostream>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write C++ code here
        return {};
    }
};`,
      testCases: [
        { inputData: "3 2 4\n6", expectedOutput: "1 2", isHidden: false, orderNum: 1 },
        { inputData: "3 3\n6", expectedOutput: "0 1", isHidden: false, orderNum: 2 },
        { inputData: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: true, orderNum: 3 },
      ],
    },
    {
      title: "Fibonacci Number",
      slug: "fibonacci-number",
      difficulty: "EASY" as const,
      description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

That is:
\`\`\`
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.
\`\`\`

Given \`n\`, calculate \`F(n)\`.`,
      constraints: `0 <= n <= 30`,
      timeLimit: 1000,
      memoryLimit: 128,
      editorial: `Use dynamic programming or simple iteration to track the last two numbers. Time complexity is O(N) and space complexity is O(1).`,
      templateCodeCpp: `#include <iostream>

class Solution {
public:
    int fib(int n) {
        // Write C++ code here
        return 0;
    }
};`,
      testCases: [
        { inputData: "2", expectedOutput: "1", isHidden: false, orderNum: 1 },
        { inputData: "3", expectedOutput: "2", isHidden: false, orderNum: 2 },
        { inputData: "4", expectedOutput: "3", isHidden: true, orderNum: 3 },
        { inputData: "10", expectedOutput: "55", isHidden: true, orderNum: 4 },
      ],
    },
    {
      title: "Longest Common Subsequence",
      slug: "longest-common-subsequence",
      difficulty: "MEDIUM" as const,
      description: `Given two strings \`text1\` and \`text2\`, return the length of their longest common subsequence. If there is no common subsequence, return \`0\`.

A **subsequence** of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, \`"abc"\` is a subsequence of \`"adebc"\`.`,
      constraints: `1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.`,
      timeLimit: 2000,
      memoryLimit: 256,
      editorial: `Use a 2D dynamic programming grid where dp[i][j] represents the LCS of text1[0..i] and text2[0..j]. If text1[i] == text2[j], dp[i][j] = dp[i-1][j-1] + 1, else max(dp[i-1][j], dp[i][j-1]). Complexity is O(N*M) time and O(N*M) space.`,
      templateCodeCpp: `#include <string>
#include <vector>
#include <iostream>

using namespace std;

class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        // Write C++ code here
        return 0;
    }
};`,
      testCases: [
        { inputData: "abcde\nace", expectedOutput: "3", isHidden: false, orderNum: 1 },
        { inputData: "abc\nabc", expectedOutput: "3", isHidden: false, orderNum: 2 },
        { inputData: "abc\ndef", expectedOutput: "0", isHidden: true, orderNum: 3 },
      ],
    },
  ];

  const problemIds: Record<string, string> = {};

  for (const prob of seededProblems) {
    const [existingProb] = await db
      .select()
      .from(problems)
      .where(eq(problems.slug, prob.slug))
      .limit(1);

    if (!existingProb) {
      console.log(`Seeding problem: ${prob.title}`);
      const [newProb] = await db
        .insert(problems)
        .values({
          title: prob.title,
          slug: prob.slug,
          difficulty: prob.difficulty,
          description: prob.description,
          constraints: prob.constraints,
          timeLimit: prob.timeLimit,
          memoryLimit: prob.memoryLimit,
          editorial: prob.editorial,
          templateCodeCpp: prob.templateCodeCpp,
          createdById: adminId,
        })
        .returning();

      problemIds[prob.slug] = newProb.id;

      for (const tc of prob.testCases) {
        await db.insert(testCases).values({
          problemId: newProb.id,
          inputData: tc.inputData,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          orderNum: tc.orderNum,
        });
      }
    } else {
      problemIds[prob.slug] = existingProb.id;
      console.log(`Problem ${prob.title} already exists.`);
    }
  }

  // 5. Seed Contests
  console.log("Seeding Contests...");
  const now = new Date();

  // Past Contest: FINISHED
  const pastStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const pastEnd = new Date(pastStart.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  // Live Contest: APPROVED (Ongoing)
  const liveStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
  const liveEnd = new Date(liveStart.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

  // Upcoming Contest: APPROVED
  const upcomingStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // in 2 days
  const upcomingEnd = new Date(upcomingStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const contestList = [
    {
      title: "Speed Run #1",
      description: "A fast-paced algorithmic sprint. Prove your coding speed on basic arrays and sequences.",
      startTime: pastStart,
      endTime: pastEnd,
      durationMinutes: 60,
      isUniversityOnly: false,
      status: "FINISHED" as const,
    },
    {
      title: "Weekly Challenge #42",
      description: "Platform-wide weekend challenge covering classic Dynamic Programming and Graph queries.",
      startTime: liveStart,
      endTime: liveEnd,
      durationMinutes: 180,
      isUniversityOnly: false,
      status: "APPROVED" as const,
    },
    {
      title: "University Code Duel (FAST)",
      description: "Private university-wide practice arena for FAST NUCES students.",
      startTime: upcomingStart,
      endTime: upcomingEnd,
      durationMinutes: 120,
      isUniversityOnly: true,
      universityId: univIds["fast-nu"] || null,
      status: "APPROVED" as const,
    },
  ];

  for (const c of contestList) {
    const [existingContest] = await db
      .select()
      .from(contests)
      .where(eq(contests.title, c.title))
      .limit(1);

    if (!existingContest) {
      console.log(`Creating contest: ${c.title}`);
      const [newContest] = await db
        .insert(contests)
        .values({
          title: c.title,
          description: c.description,
          startTime: c.startTime,
          endTime: c.endTime,
          durationMinutes: c.durationMinutes,
          createdById: adminId,
          isUniversityOnly: c.isUniversityOnly,
          universityId: c.universityId,
          status: c.status,
        })
        .returning();

      // Add Problems to Contests
      let problemSlug = "two-sum";
      if (c.title === "Weekly Challenge #42") problemSlug = "longest-common-subsequence";
      const probId = problemIds[problemSlug] || problemIds["two-sum"];

      if (probId) {
        await db.insert(contestProblems).values({
          contestId: newContest.id,
          problemId: probId,
          points: 100,
          orderNum: 1,
        });

        // Add a second problem if it's the weekly challenge
        if (c.title === "Weekly Challenge #42" && problemIds["fibonacci-number"]) {
          await db.insert(contestProblems).values({
            contestId: newContest.id,
            problemId: problemIds["fibonacci-number"],
            points: 200,
            orderNum: 2,
          });
        }
      }

      // Add participants for finished/live contest
      if (c.status === "FINISHED" || c.status === "APPROVED") {
        for (const studentId of studentIds) {
          await db.insert(contestParticipants).values({
            contestId: newContest.id,
            userId: studentId,
            score: c.status === "FINISHED" ? Math.floor(Math.random() * 200) : 0,
            penaltyTime: c.status === "FINISHED" ? Math.floor(Math.random() * 3600) : 0,
          });
        }
      }
    } else {
      console.log(`Contest ${c.title} already exists.`);
    }
  }

  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
