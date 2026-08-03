import { neon } from "@neondatabase/serverless";

// HTTP-based driver — works perfectly in Vercel Functions
export const sql = neon(process.env.DATABASE_URL!);