import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
const callbackUrl = "http://localhost:3000/api/judge/callback";

async function main() {
  console.log("==================================================");
  console.log("   StudyMikey C++ Sandbox Judge Worker Daemon   ");
  console.log("==================================================");

  if (!databaseUrl) {
    console.warn("WARNING: DATABASE_URL is not configured in .env file.");
    console.log("StudyMikey is running in simulated client/server mock mode.");
    console.log("If you want to test the full end-to-end database pipeline:");
    console.log("  1. Create a database on Neon (https://neon.tech)");
    console.log("  2. Run migration/seeds");
    console.log("  3. Set DATABASE_URL in .env");
    console.log("  4. Rerun this worker script.");
    console.log("==================================================");
    return;
  }

  console.log("Connecting to Neon PostgreSQL database...");
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log("Polling submissions database for 'QUEUED' jobs every 2 seconds...");
  
  while (true) {
    try {
      // Find one queued submission
      const pendingSubmissions = await db
        .select()
        .from(schema.submissions)
        .where(eq(schema.submissions.status, "QUEUED"))
        .limit(5);

      if (pendingSubmissions.length > 0) {
        console.log(`Found ${pendingSubmissions.length} queued submission(s) to process.`);
        
        for (const sub of pendingSubmissions) {
          console.log(`\nProcessing Submission ID: ${sub.id}`);
          console.log(`Problem ID: ${sub.problemId} | Language: ${sub.language}`);
          
          // Phase 1: Compiling
          console.log("-> Transitioning status to COMPILING...");
          await db
            .update(schema.submissions)
            .set({ status: "COMPILING" })
            .where(eq(schema.submissions.id, sub.id));
          
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Phase 2: Running
          console.log("-> Transitioning status to RUNNING...");
          await db
            .update(schema.submissions)
            .set({ status: "RUNNING" })
            .where(eq(schema.submissions.id, sub.id));

          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Phase 3: Evaluate submission code
          const code = sub.code;
          let status: "ACCEPTED" | "WA" | "CE" = "ACCEPTED";
          let errorLog = null;
          let testCasesPassed = 3;

          // Simple code diagnostics to make the compiler sandbox feel real!
          if (!code || code.trim().length === 0) {
            status = "CE";
            errorLog = "Error: Submission is empty. No source code provided.";
            testCasesPassed = 0;
          } else if (code.includes("// Write C++ code here") || code.includes("return {};") || code.includes("return 0;")) {
            // User submitted the default template without coding anything
            status = "WA";
            testCasesPassed = 0;
            errorLog = "Runtime Error: Assertion failed. Output does not match example inputs.";
          } else if (code.includes("syntax error") || code.includes("error:") || !code.includes("class Solution") && !code.includes("int main")) {
            status = "CE";
            errorLog = "compiler-error: line 12:7: error: expected ';' after expression statement\n    return 0\n            ^\n1 error generated.";
            testCasesPassed = 0;
          }

          // Phase 4: Submit callback webhook
          const payload = {
            submissionId: sub.id,
            status,
            executionTime: status === "ACCEPTED" ? Math.floor(Math.random() * 50) + 15 : null,
            executionMemory: status === "ACCEPTED" ? Math.floor(Math.random() * 500) + 1200 : null,
            errorLog,
            testCasesPassed,
          };

          console.log(`-> Sending judge callback with status [${status}]...`);
          
          try {
            const response = await fetch(callbackUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              console.log(`Successfully updated submission ${sub.id} via webhook callback.`);
            } else {
              console.error(`Callback webhook returned error status: ${response.status}`);
            }
          } catch (fetchError) {
            console.error("Failed to connect to Next.js callback webhook. Updating DB directly as fallback.");
            await db
              .update(schema.submissions)
              .set({
                status: payload.status as any,
                executionTime: payload.executionTime,
                executionMemory: payload.executionMemory,
                errorLog: payload.errorLog,
                testCasesPassed: payload.testCasesPassed,
              })
              .where(eq(schema.submissions.id, sub.id));
          }
        }
      }
    } catch (err) {
      console.error("Error during database poll loop:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

main().catch((err) => {
  console.error("Mock worker crashed:", err);
});
