import { readFileSync } from "fs";
import pg from "pg";

const envContent = readFileSync(".env.local", "utf8");
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
};

const pw = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const ref = new URL(getEnv("NEXT_PUBLIC_SUPABASE_URL")).hostname.split(".")[0];

const sql = readFileSync("supabase-migration.sql", "utf8");

// Try direct connection first
const pool = new pg.Pool({
  connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(pw)}@db.${ref}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("✅ Migración ejecutada correctamente");
} catch (e) {
  console.error("❌", e.message);
} finally {
  await pool.end();
}
