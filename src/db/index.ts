import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: any = null;

// Lazy database client proxy to prevent build-time crashes when DATABASE_URL is not provided
export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!dbInstance) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        console.warn("WARNING: DATABASE_URL is missing. Falling back to dummy credentials.");
      }
      const sql = neon(databaseUrl || "postgresql://dbuser:dbpass@localhost.localdomain/dbname");
      dbInstance = drizzle(sql, { schema });
    }
    return Reflect.get(dbInstance, prop);
  },
});

export type DbClient = typeof db;
