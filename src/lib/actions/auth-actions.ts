"use server";

import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function registerUserAction(formData: {
  username: string;
  email: string;
  passwordHash: string; // plaintext from form client, will hash on server
  role?: "STUDENT" | "TEACHER" | "RECRUITER" | "ADMIN";
}) {
  try {
    const { username, email, passwordHash, role = "STUDENT" } = formData;

    if (!username || !email || !passwordHash) {
      return { success: false, error: "Username, email, and password are required." };
    }

    // Clean username
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return { success: false, error: "Username must be at least 3 URL-friendly characters." };
    }

    // Try database insertion
    try {
      const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, cleanUsername)))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "Email or username already in use." };
      }

      // Hash
      const hashed = await bcrypt.hash(passwordHash, 10);

      // Insert
      const [newUser] = await db
        .insert(users)
        .values({
          email: email.trim().toLowerCase(),
          username: cleanUsername,
          passwordHash: hashed,
          role,
        })
        .returning();

      // Create default profile
      await db.insert(profiles).values({
        userId: newUser.id,
        bio: `Hi, I am ${newUser.username}. Welcome to my StudyMikey developer profile!`,
      });

      return { success: true };
    } catch (dbError) {
      console.warn("Database connection issue. Registering user in Demo Mode.", dbError);

      // Initialize in-memory demoUsers array globally if not already set
      const globalRef = global as any;
      if (!globalRef.demoUsers) {
        globalRef.demoUsers = [];
      }

      // Check duplicates in memory
      const exists = globalRef.demoUsers.some(
        (u: any) => u.email === email.trim().toLowerCase() || u.username === cleanUsername
      );

      if (exists) {
        return { success: false, error: "Email or username already in use (Demo Mode)." };
      }

      // Hash and store in memory
      const hashed = await bcrypt.hash(passwordHash, 10);
      const demoId = `demo-user-${Math.random().toString(36).substr(2, 9)}`;
      
      globalRef.demoUsers.push({
        id: demoId,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        passwordHash: hashed,
        role,
      });

      return { 
        success: true, 
        isDemo: true, 
        message: "Offline Demo Mode active. Account cached in memory!" 
      };
    }
  } catch (error: any) {
    console.error("Registration Error:", error);
    return { success: false, error: error.message || "Failed to register user." };
  }
}
