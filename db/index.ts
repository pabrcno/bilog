import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

// Configure neon
neonConfig.fetchConnectionCache = true

// Create a SQL client with Neon
const sql = neon<boolean, boolean>(process.env.DATABASE_URL!)

// Create a Drizzle client with our schema
export const db = drizzle(sql, { schema })
