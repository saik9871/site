import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not configured');
  throw new Error('DATABASE_URL is not configured in environment variables');
}

// Create the database connection
export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
