import { neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import * as schema from "@/db/schema"

// Configure neon for Node.js WebSocket
neonConfig.webSocketConstructor = ws
neonConfig.fetchConnectionCache = true

// Create a Drizzle client with our schema and WebSocket connection
export const db = drizzle(process.env.DATABASE_URL!, { schema })
