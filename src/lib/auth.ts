import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy-client-secret",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 1. Try PostgreSQL Database authentication
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.username,
                role: user.role,
              };
            }
          }
        } catch (dbError) {
          console.warn("Database connection offline. Authenticating via Demo Mode registries.", dbError);
        }

        // 2. Try In-Memory Demo Users registered during this session
        const globalRef = global as any;
        const demoUsersList = globalRef.demoUsers || [];
        const demoUser = demoUsersList.find((u: any) => u.email === credentials.email.trim().toLowerCase());

        if (demoUser) {
          const isValid = await bcrypt.compare(credentials.password, demoUser.passwordHash);
          if (isValid) {
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.username,
              role: demoUser.role,
            };
          }
        }

        // 3. Fallback to Default Seeded Mock Accounts
        const defaultMocks = [
          { email: "admin@studymikey.com", username: "admin", role: "ADMIN", pass: "admin123" },
          { email: "teacher@nu.edu.pk", username: "dr_carter", role: "TEACHER", pass: "password123" },
          { email: "recruiter@studymikey.com", username: "sarah_google", role: "RECRUITER", pass: "password123" },
          { email: "student@studymikey.com", username: "jane_coder", role: "STUDENT", pass: "password123" },
        ];

        const matchingMock = defaultMocks.find(
          (m) => m.email === credentials.email.trim().toLowerCase()
        );

        if (matchingMock && credentials.password === matchingMock.pass) {
          return {
            id: `mock-${matchingMock.username}`,
            email: matchingMock.email,
            name: matchingMock.username,
            role: matchingMock.role,
          };
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = user.name || "";
      }

      // Save access token for Github API requests
      if (account && account.provider === "github" && account.access_token) {
        token.accessToken = account.access_token;
      }

      // Handle GitHub OAuth Auto-Registration
      if (account?.provider === "github" && token.email) {
        try {
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, token.email))
            .limit(1);

          if (!existingUser) {
            const baseUsername = token.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
            const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

            const [newUser] = await db
              .insert(users)
              .values({
                email: token.email,
                username,
                role: "STUDENT",
                googleId: null,
              })
              .returning();

            await db.insert(profiles).values({
              userId: newUser.id,
              bio: `Hello! I am ${username}. Welcome to my StudyMikey coding profile.`,
            });

            token.id = newUser.id;
            token.role = newUser.role;
            token.username = newUser.username;
          } else {
            token.id = existingUser.id;
            token.role = existingUser.role;
            token.username = existingUser.username;
          }
        } catch (dbError) {
          console.warn("Database connection issue during GitHub login. Defaulting to mock profile.", dbError);
          token.id = `mock-github-${token.email.split("@")[0]}`;
          token.role = "STUDENT";
          token.username = token.email.split("@")[0];
        }
      }

      // Handle Google OAuth Auto-Registration
      if (account?.provider === "google" && token.email) {
        try {
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, token.email))
            .limit(1);

          if (!existingUser) {
            const baseUsername = token.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
            const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

            const [newUser] = await db
              .insert(users)
              .values({
                email: token.email,
                username,
                role: "STUDENT",
                googleId: account.providerAccountId,
              })
              .returning();

            await db.insert(profiles).values({
              userId: newUser.id,
              bio: `Hello! I am ${username}. Welcome to my StudyMikey coding profile.`,
            });

            token.id = newUser.id;
            token.role = newUser.role;
            token.username = newUser.username;
          } else {
            token.id = existingUser.id;
            token.role = existingUser.role;
            token.username = existingUser.username;
          }
        } catch (dbError) {
          console.warn("Database connection issue during Google login. Defaulting to mock profile.", dbError);
          token.id = `mock-google-${token.email.split("@")[0]}`;
          token.role = "STUDENT";
          token.username = token.email.split("@")[0];
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        (session as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};
