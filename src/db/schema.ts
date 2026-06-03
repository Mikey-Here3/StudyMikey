import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Enums
export const roleEnum = pgEnum("role", ["STUDENT", "TEACHER", "RECRUITER", "ADMIN"]);
export const contestStatusEnum = pgEnum("contest_status", ["DRAFT", "UNDER_REVIEW", "APPROVED", "FINISHED"]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "QUEUED",
  "COMPILING",
  "RUNNING",
  "ACCEPTED",
  "WA",
  "TLE",
  "MLE",
  "RE",
  "CE",
]);
export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD"]);

// 2. Universities Table
export const universities = pgTable("universities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  emailDomain: varchar("email_domain", { length: 100 }).notNull().unique(),
  logoUrl: varchar("logo_url", { length: 500 }),
  score: integer("score").default(0).notNull(),
  nationalRank: integer("national_rank").default(9999).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 3. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  role: roleEnum("role").default("STUDENT").notNull(),
  googleId: varchar("google_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 4. Profiles Table
export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  rating: integer("rating").default(1200).notNull(),
  maxRating: integer("max_rating").default(1200).notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActiveDate: date("last_active_date").defaultNow(),
  skills: text("skills").array().default([]),
  resumeUrl: varchar("resume_url", { length: 500 }),
  githubLink: varchar("github_link", { length: 255 }),
  universityId: uuid("university_id").references(() => universities.id, {
    onDelete: "set null",
  }),
  isOpenToWork: boolean("is_open_to_work").default(false).notNull(),
});

// 5. Projects Table (Showcases)
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description").notNull(),
  repoUrl: varchar("repo_url", { length: 500 }),
  demoUrl: varchar("demo_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  technologies: text("technologies").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 6. Certificates Table
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  issuingOrg: varchar("issuing_org", { length: 255 }).notNull(),
  issueDate: date("issue_date").notNull(),
  credentialId: varchar("credential_id", { length: 100 }),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

// 7. Problems Table
export const problems = pgTable("problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  difficulty: difficultyEnum("difficulty").default("MEDIUM").notNull(),
  description: text("description").notNull(),
  constraints: text("constraints"),
  timeLimit: integer("time_limit").default(2000).notNull(), // ms
  memoryLimit: integer("memory_limit").default(256).notNull(), // MB
  editorial: text("editorial"),
  templateCodeCpp: text("template_code_cpp"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 8. TestCases Table
export const testCases = pgTable("test_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  inputData: text("input_data").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isHidden: boolean("is_hidden").default(true).notNull(),
  orderNum: integer("order_num").default(0).notNull(),
});

// 9. Contests Table
export const contests = pgTable("contests", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  isUniversityOnly: boolean("is_university_only").default(false).notNull(),
  universityId: uuid("university_id").references(() => universities.id, {
    onDelete: "set null",
  }),
  status: contestStatusEnum("status").default("DRAFT").notNull(),
});

// 10. ContestProblems Table
export const contestProblems = pgTable(
  "contest_problems",
  {
    contestId: uuid("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    points: integer("points").default(100).notNull(),
    orderNum: integer("order_num").default(0).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contestId, t.problemId] }),
  })
);

// 11. Submissions Table
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  contestId: uuid("contest_id").references(() => contests.id, {
    onDelete: "set null",
  }),
  code: text("code").notNull(),
  language: varchar("language", { length: 10 }).default("CPP").notNull(),
  status: submissionStatusEnum("status").default("QUEUED").notNull(),
  executionTime: integer("execution_time"), // ms
  executionMemory: integer("execution_memory"), // KB
  errorLog: text("error_log"),
  testCasesPassed: integer("test_cases_passed").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 12. ContestParticipants Table
export const contestParticipants = pgTable(
  "contest_participants",
  {
    contestId: uuid("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
    score: integer("score").default(0).notNull(),
    penaltyTime: integer("penalty_time").default(0).notNull(), // seconds
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contestId, t.userId] }),
  })
);

// 13. Follows Table
export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  })
);

// 14. Achievements Table
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  badgeImageUrl: varchar("badge_image_url", { length: 500 }).notNull(),
  conditionType: varchar("condition_type", { length: 50 }).notNull(),
  conditionValue: integer("condition_value").notNull(),
});

// 15. UserAchievements Table
export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.achievementId] }),
  })
);

// ==========================================
// RELATIONSHIPS DEFINITIONS
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  submissions: many(submissions),
  contestsCreated: many(contests),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  achievements: many(userAchievements),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  university: one(universities, {
    fields: [profiles.universityId],
    references: [universities.id],
  }),
  projects: many(projects),
  certificates: many(certificates),
}));

export const universitiesRelations = relations(universities, ({ many }) => ({
  profiles: many(profiles),
  contests: many(contests),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  profile: one(profiles, {
    fields: [projects.profileId],
    references: [profiles.userId],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  profile: one(profiles, {
    fields: [certificates.profileId],
    references: [profiles.userId],
  }),
}));

export const problemsRelations = relations(problems, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [problems.createdById],
    references: [users.id],
  }),
  testCases: many(testCases),
  submissions: many(submissions),
  contestProblems: many(contestProblems),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, {
    fields: [testCases.problemId],
    references: [problems.id],
  }),
}));

export const contestsRelations = relations(contests, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [contests.createdById],
    references: [users.id],
  }),
  university: one(universities, {
    fields: [contests.universityId],
    references: [universities.id],
  }),
  contestProblems: many(contestProblems),
  participants: many(contestParticipants),
  submissions: many(submissions),
}));

export const contestProblemsRelations = relations(contestProblems, ({ one }) => ({
  contest: one(contests, {
    fields: [contestProblems.contestId],
    references: [contests.id],
  }),
  problem: one(problems, {
    fields: [contestProblems.problemId],
    references: [problems.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
  contest: one(contests, {
    fields: [submissions.contestId],
    references: [contests.id],
  }),
}));

export const contestParticipantsRelations = relations(contestParticipants, ({ one }) => ({
  contest: one(contests, {
    fields: [contestParticipants.contestId],
    references: [contests.id],
  }),
  user: one(users, {
    fields: [contestParticipants.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  usersAwarded: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));
